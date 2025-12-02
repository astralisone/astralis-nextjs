import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Alert component following Astralis brand specification (Section 3.3)
 *
 * Displays contextual feedback messages for user actions.
 *
 * Features:
 * - Multiple variants: success, error, warning, info
 * - Optional icon display
 * - Title and description support
 * - Accessible markup with proper ARIA roles
 *
 * Specifications:
 * - Border Radius: 8px
 * - Padding: 16px
 * - Border: 1px variant color
 * - Background: Light variant color
 * - Icons: Lucide React with variant color
 *
 * @example
 * ```tsx
 * <Alert variant="success">
 *   <AlertTitle>Success</AlertTitle>
 *   <AlertDescription>Your changes have been saved.</AlertDescription>
 * </Alert>
 * ```
 */

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-white border-slate-300 text-slate-900",
        success:
          "border-green-500/50 bg-green-50 text-green-900 [&>svg]:text-green-600",
        error:
          "border-red-500/50 bg-red-50 text-red-900 [&>svg]:text-red-600",
        warning:
          "border-yellow-500/50 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600",
        info: "border-blue-500/50 bg-blue-50 text-blue-900 [&>svg]:text-astralis-blue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Alert root component
 *
 * @param variant - The alert type (default, success, error, warning, info)
 * @param showIcon - Whether to display the variant icon
 * @param className - Additional CSS classes
 */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Whether to show the icon for the alert variant
   * @default false
   */
  showIcon?: boolean;
}

const iconMap = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", showIcon = false, children, ...props }, ref) => {
    const Icon = iconMap[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && <Icon className="h-4 w-4" />}
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

/**
 * AlertTitle - The title/heading for the alert
 *
 * @param className - Additional CSS classes
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

/**
 * AlertDescription - The description/body text for the alert
 *
 * @param className - Additional CSS classes
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
