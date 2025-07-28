import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createSupabaseServer } from "@/lib/supabase"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    if (!signature) throw new Error("Missing signature")
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error("[WEBHOOK_VERIFY_ERROR]", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createSupabaseServer()
  const supabaseAdmin = createSupabaseServer(true)

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === "active" ? "active" : "inactive"
        await supabase.from("subscriptions").update({ status }).eq("stripe_subscription_id", sub.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription as string)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from("subscriptions")
          .update({ status: "active" })
          .eq("stripe_subscription_id", invoice.subscription as string)

        // Buscar o email do usuário pelo stripe_customer_id
        const { data: user, error } = await supabase
          .from("users")
          .select("email")
          .eq("stripe_customer_id", invoice.customer)
          .single()

        if (user && user.email) {
          // 4) Envia magic link automaticamente
          const { error: linkErr2 } =
            await supabaseAdmin.auth.signInWithOtp({
              email: user.email,
              options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-request`,
              },
            });
          if (linkErr2) {
            console.error("❌ Falha ao enviar magic link (invoice):", linkErr2);
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[WEBHOOK_PROCESS_ERROR]", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
