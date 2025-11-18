import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea component following Astralis brand specification (Section 3.3)
 *
 * Specifications:
 * - Same styling as Input component
 * - Border: Slate-300 (#E2E8F0)
 * - Border Radius: 6px
 * - No default shadow
 * - Focus ring: Astralis Blue 2px
 * - Transition: 150ms ease-out (Section 2.2)
 * - Min-height: 80px
 */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
