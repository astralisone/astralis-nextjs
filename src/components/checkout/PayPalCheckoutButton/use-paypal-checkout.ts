"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/store"
import { useToast } from "@/hooks"

export function usePayPalCheckout() {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const clearCart = useCart((state) => state.clearCart)
  const { toast } = useToast()

  const handleApprove = async (data: any, actions: any) => {
    console.log("PayPal onApprove:", JSON.stringify(data))
    try {
      setIsProcessing(true)
      const order = await actions.order?.capture()

      if (order) {
        clearCart()
        toast({
          title: "Payment successful!",
          description: "Your order has been processed successfully.",
        })
        router.push(`/checkout/success?orderId=${order.id}`)
      }
    } catch (error) {
      console.error("PayPal capture error:", error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = (err: unknown) => {
    console.error("PayPal error:", err)
    toast({
      title: "Payment failed",
      description: "There was an error initializing PayPal. Please try again.",
      variant: "destructive",
    })
  }

  return {
    isProcessing,
    handleApprove,
    handleError
  }
}
