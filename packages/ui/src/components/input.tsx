import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Input component following Astralis brand specification (Section 3.3)
 *
 * Standard text input field with brand-compliant styling.
 *
 * Specifications:
 * - Border: Slate-300 (#E2E8F0)
 * - Border Radius: 6px
 * - No default shadow
 * - Focus ring: Astralis Blue 2px
 * - Transition: 150ms ease-out (Section 2.2)
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * ```
 */

/**
 * Input Props
 *
 * @param className - Additional CSS classes to apply
 * @param type - Input type (text, email, password, etc.)
 * @param placeholder - Placeholder text
 * @param value - Controlled value
 * @param onChange - Change event handler
 * @param disabled - Whether the input is disabled
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500",
          "dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-400",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
