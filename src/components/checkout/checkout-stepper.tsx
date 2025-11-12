"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckoutStep {
  id: string
  title: string
  description: string
}

interface CheckoutStepperProps {
  steps: CheckoutStep[]
  currentStep: number
  completedSteps: number[]
}

export function CheckoutStepper({ steps, currentStep, completedSteps }: CheckoutStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    {
                      "bg-primary border-primary text-primary-foreground": isCompleted,
                      "bg-primary/20 border-primary text-primary": isCurrent,
                      "bg-muted border-muted-foreground/30 text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-3 text-center max-w-[120px]">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      {
                        "text-primary": isCompleted || isCurrent,
                        "text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mt-[-40px]">
                  <div
                    className={cn(
                      "h-0.5 transition-colors duration-300",
                      {
                        "bg-primary": isCompleted,
                        "bg-primary/30": isCurrent,
                        "bg-muted-foreground/30": isUpcoming,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const defaultCheckoutSteps: CheckoutStep[] = [
  {
    id: "cart-review",
    title: "Review Cart",
    description: "Verify your items"
  },
  {
    id: "shipping-info",
    title: "Shipping Info",
    description: "Enter your details"
  },
  {
    id: "payment",
    title: "Payment",
    description: "Complete purchase"
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Order complete"
  }
]
