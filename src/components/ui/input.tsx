import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input component following Astralis brand specification (Section 3.3)
 *
 * Specifications:
 * - Border: Slate-300 (#E2E8F0)
 * - Border Radius: 6px
 * - No default shadow
 * - Focus ring: Astralis Blue 2px
 * - Transition: 150ms ease-out (Section 2.2)
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
