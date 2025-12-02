import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button component following Astralis brand specification (Section 3.3)
 *
 * Versatile button component with multiple variants and sizes.
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
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */

const buttonVariants = cva(
  // Base styles - all buttons with enhanced styling
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: Astralis Blue background, white text with enhanced hover
        primary:
          "bg-astralis-blue text-white shadow-md hover:bg-[#245a92] hover:shadow-lg hover:scale-105 dark:bg-astralis-blue dark:hover:bg-[#245a92]",

        // Secondary: Blue border with enhanced styling
        secondary:
          "border-2 border-astralis-blue text-astralis-blue hover:bg-astralis-blue hover:text-white shadow-sm hover:shadow-md dark:border-astralis-blue dark:text-astralis-blue dark:hover:bg-astralis-blue dark:hover:text-white",

        // Destructive: Error color
        destructive:
          "bg-error text-white shadow-sm hover:bg-error/90 hover:shadow-md dark:bg-error dark:hover:bg-error/90",

        // Outline: Neutral border
        outline:
          "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-500",

        // Ghost: No background
        ghost:
          "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",

        // Link: Text only
        link:
          "text-astralis-blue underline-offset-4 hover:underline dark:text-astralis-blue",
      },
      size: {
        default: "px-6 py-3 text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-lg",
        icon: "p-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/**
 * Button Props
 *
 * @param variant - Visual style variant (primary, secondary, destructive, outline, ghost, link)
 * @param size - Size of the button (sm, default, lg, icon)
 * @param asChild - Render as a child element using Radix Slot
 * @param className - Additional CSS classes
 * @param disabled - Whether the button is disabled
 * @param onClick - Click event handler
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child element using Radix Slot */
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
