import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-purple-500/80 to-violet-500/80 text-white hover:from-purple-600/90 hover:to-violet-600/90 shadow-lg shadow-purple-500/25",
        secondary:
          "border-white/20 bg-white/10 text-gray-200 hover:bg-white/20 hover:border-white/30",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white hover:from-red-600/90 hover:to-pink-600/90 shadow-lg shadow-red-500/25",
        outline: "text-foreground border-white/20 hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
