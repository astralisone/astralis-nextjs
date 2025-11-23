import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/**
 * Label component following Astralis brand specification (Section 3.3)
 *
 * Accessible label for form inputs using Radix UI Label primitive.
 * Automatically associates with form controls for proper accessibility.
 *
 * Specifications:
 * - Uses Radix UI Label primitive
 * - Font weight: 500 (medium)
 * - Text size: sm (14px)
 * - Color: Slate-700 for consistency with brand neutrals
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 * ```
 */

/**
 * Label Props
 *
 * @param className - Additional CSS classes to apply
 * @param htmlFor - ID of the form element this label is for
 * @param children - Label text content
 */
export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-slate-700",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
