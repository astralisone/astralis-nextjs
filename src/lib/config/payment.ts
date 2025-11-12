// Default test client ID from PayPal documentation
const TEST_CLIENT_ID = "test"

export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || TEST_CLIENT_ID,
  currency: "USD",
  intent: "capture"
} as const

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
} as const
