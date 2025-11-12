"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { usePayPalCheckout } from "./use-paypal-checkout"

interface PayPalButtonProps {
  amount: number
  onSuccess?: (paymentData: any) => void
  onError?: (error: any) => void
}

export function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const { handleApprove, handleError } = usePayPalCheckout()

  // Use custom handlers if provided, otherwise fall back to default
  const approveHandler = onSuccess
    ? async (data: any, actions: any) => {
        try {
          const order = await actions.order?.capture()
          if (order) {
            onSuccess(order)
          }
        } catch (error) {
          console.error("PayPal capture error:", error)
          if (onError) {
            onError(error)
          } else {
            handleError(error)
          }
        }
      }
    : handleApprove

  const errorHandler = onError || handleError

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        shape: "rect",
        label: "pay",
      }}
      createOrder={(_, actions) => {
        try {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: "USD",
                },
              },
            ],
          })
        } catch (error) {
          console.error("Error creating PayPal order:", error)
          throw error
        }
      }}
      onApprove={approveHandler}
      onError={errorHandler}
    />
  )
}
