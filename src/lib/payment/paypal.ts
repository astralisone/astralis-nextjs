import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js"
import { PAYPAL_CONFIG } from "@/lib/config/payment"

export const getPayPalOptions = (): ReactPayPalScriptOptions => ({
  clientId: PAYPAL_CONFIG.clientId,
  currency: PAYPAL_CONFIG.currency,
  intent: PAYPAL_CONFIG.intent,
})
