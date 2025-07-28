import Stripe from "stripe"

/* -------------------------------------------------------------------------- */
/*  Pricing (fill the env vars on Vercel)                                     */
/* -------------------------------------------------------------------------- */
export const PLANS = {
  monthly: {
    label: "Plano Mensal",
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
    amount: 1885, // in cents
  },
  annual: {
    label: "Plano Anual (20% OFF)",
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || "",
    amount: 18085, // in cents
  },
} as const

/* -------------------------------------------------------------------------- */
/*  Lazy Stripe instance – created only at runtime                            */
/* -------------------------------------------------------------------------- */
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY não está definida nas variáveis de ambiente")
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: "2024-04-10",
    typescript: true,
  })

  return _stripe
}
