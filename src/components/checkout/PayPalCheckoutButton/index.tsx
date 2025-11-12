"use client"

import { usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { PayPalButton } from "./paypal-button"
import { PayPalLoading } from "./loading"
import { usePayPalCheckout } from "./use-paypal-checkout"

interface PayPalCheckoutButtonProps {
  amount: number
  onSuccess?: (paymentData: any) => void
  onError?: (error: any) => void
}

export function PayPalCheckoutButton({ amount, onSuccess, onError }: PayPalCheckoutButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer()
  const { isProcessing } = usePayPalCheckout()

  console.log("PayPal Button State:", { isPending, isProcessing, amount })

  if (isPending || isProcessing) {
    console.log("PayPal Button: Showing loading state")
    return <PayPalLoading />
  }

  console.log("PayPal Button: Rendering button")
  return <PayPalButton amount={amount} onSuccess={onSuccess} onError={onError} />
}
