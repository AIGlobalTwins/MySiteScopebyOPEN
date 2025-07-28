import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Permitir acesso às rotas de auth, webhooks e APIs públicas
  if (
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname.startsWith("/api/webhooks") ||
    req.nextUrl.pathname.startsWith("/api/create-checkout-session") ||
    req.nextUrl.pathname.startsWith("/api/verify-payment") ||
    req.nextUrl.pathname.startsWith("/api/check-subscription") ||
    req.nextUrl.pathname.startsWith("/api/send-magic-link") ||
    req.nextUrl.pathname.startsWith("/api/checkout-success") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/checkout")
  ) {
    return res
  }

  // Proteger dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth?from=dashboard", req.url))
    }

    // Verificar subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .single()

    if (!subscription) {
      return NextResponse.redirect(new URL("/checkout", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
