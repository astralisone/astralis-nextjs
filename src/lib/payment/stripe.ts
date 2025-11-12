import { loadStripe } from "@stripe/stripe-js"
import { STRIPE_CONFIG } from "@/lib/config/payment"

let stripePromise: ReturnType<typeof loadStripe>

export const getStripe = () => {
  if (!stripePromise && STRIPE_CONFIG.publishableKey) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)
  }
  return stripePromise
}
