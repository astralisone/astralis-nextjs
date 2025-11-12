"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Package, Zap } from "lucide-react"
import type { CartItem } from "@/lib/store"

interface EnhancedOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  taxAmount?: number
  shippingAmount?: number
  discountAmount?: number
  total: number
  showTaxBreakdown?: boolean
}

interface OrderTotals {
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
}

function calculateOrderTotals(items: CartItem[], taxRate = 0.08): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * taxRate
  const shippingAmount = 0 // Free shipping for now
  const discountAmount = 0 // No discounts for now
  const total = subtotal + taxAmount + shippingAmount - discountAmount

  return {
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount,
    total
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function getItemIcon(itemName: string) {
  const name = itemName.toLowerCase()
  if (name.includes('service') || name.includes('consultation') || name.includes('design')) {
    return <Zap className="w-4 h-4 text-primary" />
  }
  if (name.includes('digital') || name.includes('template') || name.includes('asset')) {
    return <Package className="w-4 h-4 text-blue-500" />
  }
  return <ShoppingBag className="w-4 h-4 text-muted-foreground" />
}

export function EnhancedOrderSummary({
  items,
  subtotal: propSubtotal,
  taxAmount: propTaxAmount,
  shippingAmount: propShippingAmount,
  discountAmount: propDiscountAmount,
  total: propTotal,
  showTaxBreakdown = true
}: EnhancedOrderSummaryProps) {
  // Calculate totals if not provided
  const calculated = calculateOrderTotals(items)
  const subtotal = propSubtotal ?? calculated.subtotal
  const taxAmount = propTaxAmount ?? calculated.taxAmount
  const shippingAmount = propShippingAmount ?? calculated.shippingAmount
  const discountAmount = propDiscountAmount ?? calculated.discountAmount
  const total = propTotal ?? calculated.total

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <ShoppingBag className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 backdrop-blur-sm border border-muted/30"
            >
              {/* Item Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getItemIcon(item.name)}
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight mb-1 text-foreground">
                  {item.name}
                </h4>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Qty: {item.quantity}
                  </Badge>
                  {item.quantity > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </span>
                  )}
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-muted/30" />

        {/* Order Totals */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Tax */}
          {showTaxBreakdown && taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {shippingAmount > 0 ? formatCurrency(shippingAmount) : (
                <span className="text-green-500 font-semibold">FREE</span>
              )}
            </span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-green-500">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <Separator className="bg-muted/30" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-gradient">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-primary mb-1">What's included:</p>
              <ul className="space-y-1">
                <li>• Digital delivery within 24 hours</li>
                <li>• Lifetime access to your purchases</li>
                <li>• Email support and documentation</li>
                {items.some(item => item.name.toLowerCase().includes('service')) && (
                  <li>• 30-day revision period for services</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export the calculation function for use in other components
export { calculateOrderTotals }
