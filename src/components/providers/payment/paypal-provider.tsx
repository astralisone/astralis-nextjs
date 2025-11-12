"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { getPayPalOptions } from "@/lib/payment/paypal"

interface PayPalProviderProps {
  children: React.ReactNode
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  return (
    <PayPalScriptProvider options={getPayPalOptions()}>
      {children}
    </PayPalScriptProvider>
  )
}
