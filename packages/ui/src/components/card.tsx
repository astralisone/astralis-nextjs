import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Card component following Astralis brand specification (Section 3.3)
 *
 * Specifications:
 * - Background: White
 * - Border: 1px #E2E8F0 (Slate-300)
 * - Shadow: rgba(0,0,0,0.06)
 * - Padding: 24-32px
 * - Border Radius: 8px
 * - Includes: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, ...props }, ref) => {
    const variantStyles = {
      default: "border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
      bordered: "border-2 border-slate-300",
      elevated: "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg bg-white transition-all duration-200 dark:bg-slate-800 dark:border-slate-700",
          variantStyles[variant],
          hover && "hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
