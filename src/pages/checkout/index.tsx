import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useCart } from "@/lib/store"
import { CheckoutForm, type CheckoutFormData } from "@/components/checkout/checkout-form"
import { CheckoutStepper, defaultCheckoutSteps } from "@/components/checkout/checkout-stepper"
import { EnhancedOrderSummary, calculateOrderTotals } from "@/components/checkout/enhanced-order-summary"
import { PayPalCheckoutButton } from "@/components/checkout/PayPalCheckoutButton"
import { ShoppingCart, ArrowLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMount } from "@/hooks"
import { useToast } from "@/hooks"
import axios from "@/lib/axios"
import { trackPurchase } from "@/lib/analytics/gtag"

type CheckoutStep = 'review' | 'shipping' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const mounted = useMount()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review')
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Calculate order totals
  const orderTotals = calculateOrderTotals(items)

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/marketplace")
    }
  }, [items, router, mounted])

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center glass-card p-8">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gradient">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some items to your cart to continue checkout</p>
          <Button onClick={() => router.push("/marketplace")} className="glass-button">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  const handleStepperStep = (step: CheckoutStep) => {
    const stepMap = {
      'review': 1,
      'shipping': 2,
      'payment': 3,
      'confirmation': 4
    }
    return stepMap[step]
  }

  const getCompletedSteps = () => {
    const completed: number[] = []
    if (currentStep !== 'review') completed.push(1)
    if (currentStep === 'payment' || currentStep === 'confirmation') completed.push(2)
    if (currentStep === 'confirmation') completed.push(3, 4)
    return completed
  }

  const handleShippingSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true)
    try {
      setCheckoutData(data)
      setCurrentStep('payment')
      toast({
        title: "Information saved",
        description: "Proceeding to payment...",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shipping information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createOrder = async (paymentData: any) => {
    if (!checkoutData) {
      throw new Error("Checkout data not available")
    }

    const orderData = {
      items: items.map(item => ({
        marketplaceItemId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      customerEmail: checkoutData.customerEmail,
      customerName: checkoutData.customerName,
      billingAddress: checkoutData.billingAddress,
      shippingAddress: checkoutData.shippingAddress,
      paymentMethod: 'PAYPAL' as const,
      paymentId: paymentData.id,
      paymentData: paymentData,
      notes: checkoutData.notes
    }

    const response = await axios.post('/orders', orderData)
    return response.data.data
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsLoading(true)
    try {
      // Create order in our backend
      const order = await createOrder(paymentData)
      
      // Update payment status
      await axios.patch(`/orders/${order.id}/payment`, {
        paymentStatus: 'COMPLETED',
        paymentId: paymentData.id,
        paymentData: paymentData
      })

      setOrderId(order.id)
      clearCart()

      // Track purchase conversion with Google Analytics
      trackPurchase({
        id: order.id,
        total: orderTotals.total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        currency: 'USD',
      })

      setCurrentStep('confirmation')
      
      toast({
        title: "Payment successful!",
        description: "Your order has been processed successfully.",
      })
    } catch (error) {
      console.error('Order creation failed:', error)
      toast({
        title: "Order creation failed",
        description: "Payment succeeded but order creation failed. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    toast({
      title: "Payment failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'review':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-gradient">Review Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedOrderSummary
                  items={items}
                  {...orderTotals}
                />
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setCurrentStep('shipping')}
                    size="lg"
                    className="glass-button min-w-[200px]"
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'shipping':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('review')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Review
              </Button>
            </div>
            <CheckoutForm onSubmit={handleShippingSubmit} isLoading={isLoading} />
          </div>
        )
      
      case 'payment':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('shipping')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Shipping
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gradient">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete your purchase using PayPal. You can pay with your PayPal account or use a credit/debit card.
                      </p>
                      
                      <div className="space-y-4">
                        <PayPalCheckoutButton 
                          amount={orderTotals.total}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/20 rounded-lg">
                        <p>🔒 Your payment information is secure and encrypted.</p>
                        <p>By completing this purchase, you agree to our Terms of Service.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <EnhancedOrderSummary
                  items={items}
                  {...orderTotals}
                />
              </div>
            </div>
          </div>
        )
      
      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            <Card className="glass-card p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-gradient">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been successfully processed.
              </p>
              
              {orderId && (
                <div className="bg-muted/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-lg">{orderId}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push("/marketplace")} variant="outline">
                  Continue Shopping
                </Button>
                <Button onClick={() => router.push("/orders")} className="glass-button">
                  View Orders
                </Button>
              </div>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase securely</p>
          </div>

          {/* Progress Stepper */}
          <CheckoutStepper
            steps={defaultCheckoutSteps}
            currentStep={handleStepperStep(currentStep)}
            completedSteps={getCompletedSteps()}
          />

          {/* Step Content */}
          <div className="mt-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}