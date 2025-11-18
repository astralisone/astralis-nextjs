import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button component following Astralis brand specification (Section 3.3)
 *
 * Primary Button:
 * - Background: Astralis Blue (#2B6CB0)
 * - Text: White
 * - Border radius: 6px
 * - Hover: Darker blue (#245a92)
 * - Motion: 150ms ease-out
 *
 * Secondary Button:
 * - Border: Astralis Blue 1.5px
 * - Text: Astralis Blue
 * - Hover: Light blue fill
 */

const buttonVariants = cva(
  // Base styles - all buttons with enhanced styling
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: Astralis Blue background, white text with enhanced hover
        primary:
          "bg-astralis-blue text-white shadow-md hover:bg-[#245a92] hover:shadow-lg hover:scale-105",

        // Secondary: Blue border with enhanced styling
        secondary:
          "border-2 border-astralis-blue text-astralis-blue hover:bg-astralis-blue hover:text-white shadow-sm hover:shadow-md",

        // Destructive: Error color
        destructive:
          "bg-error text-white shadow-sm hover:bg-error/90 hover:shadow-md",

        // Outline: Neutral border
        outline:
          "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400",

        // Ghost: No background
        ghost:
          "text-slate-700 hover:bg-slate-100",

        // Link: Text only
        link:
          "text-astralis-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
