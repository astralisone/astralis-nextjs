import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox component following Astralis brand specification (Section 3.3)
 *
 * Built on Radix UI Checkbox primitive for full accessibility support.
 *
 * Features:
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Indeterminate state support
 * - Form integration
 * - Custom styling with Astralis brand colors
 *
 * Specifications:
 * - Border: Slate-300 (#E2E8F0)
 * - Border Radius: 4px
 * - Checked state: Astralis Blue background
 * - Focus ring: Astralis Blue 2px
 * - Transition: 150ms ease-out (Section 2.2)
 *
 * @example
 * ```tsx
 * <div className="flex items-center space-x-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms" className="text-sm">
 *     Accept terms and conditions
 *   </label>
 * </div>
 * ```
 */

/**
 * Checkbox Props
 *
 * @param className - Additional CSS classes to apply
 * @param checked - Controlled checked state
 * @param defaultChecked - Default checked state for uncontrolled usage
 * @param onCheckedChange - Callback when checked state changes
 * @param disabled - Whether the checkbox is disabled
 */
export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 ring-offset-white",
      "transition-all duration-150 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-astralis-blue data-[state=checked]:border-astralis-blue data-[state=checked]:text-white",
      "data-[state=indeterminate]:bg-astralis-blue data-[state=indeterminate]:border-astralis-blue data-[state=indeterminate]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
