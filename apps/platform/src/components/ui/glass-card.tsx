import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * GlassCard Component - Modern glassmorphism design
 *
 * Design Specifications:
 * - Frosted glass effect with backdrop blur
 * - Subtle glow borders with optional animation
 * - Multiple variants: default, elevated, bordered, glowing
 * - Semi-transparent backgrounds for layering
 * - Hover states with enhanced glow effects
 *
 * Component API Surface:
 * - Variants control visual style (default, elevated, bordered, glowing)
 * - Blur intensity controls backdrop filter strength
 * - Glow color customization via props
 * - Composable with Header, Content, Footer subcomponents
 *
 * @example
 * ```tsx
 * <GlassCard variant="glowing" blur="strong">
 *   <GlassCardHeader>
 *     <GlassCardTitle>Feature Title</GlassCardTitle>
 *   </GlassCardHeader>
 *   <GlassCardContent>Content here</GlassCardContent>
 * </GlassCard>
 * ```
 */

const glassCardVariants = cva(
  // Base glassmorphism styles
  "rounded-xl backdrop-blur-md transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        // Default: Subtle glass effect
        default:
          "bg-white/10 dark:bg-slate-900/30 border border-white/20 dark:border-slate-700/50 shadow-lg",

        // Elevated: More prominent with stronger shadow
        elevated:
          "bg-white/20 dark:bg-slate-900/40 border border-white/30 dark:border-slate-700/60 shadow-xl hover:shadow-2xl",

        // Bordered: Emphasis on border with glow
        bordered:
          "bg-white/5 dark:bg-slate-900/20 border-2 border-astralis-blue/40 shadow-lg hover:border-astralis-blue/60",

        // Glowing: Full glow effect with animation
        glowing:
          "bg-white/10 dark:bg-slate-900/30 border border-astralis-blue/50 shadow-[0_0_20px_rgba(43,108,176,0.3)] hover:shadow-[0_0_30px_rgba(43,108,176,0.5)] hover:border-astralis-blue/70",
      },
      blur: {
        none: "backdrop-blur-none",
        light: "backdrop-blur-sm",
        medium: "backdrop-blur-md",
        strong: "backdrop-blur-lg",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] hover:-translate-y-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      blur: "medium",
      interactive: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  /**
   * Enable pulsing glow animation
   */
  animated?: boolean;

  /**
   * Custom glow color (CSS color value)
   */
  glowColor?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, blur, interactive, animated, glowColor, ...props }, ref) => {
    const style = glowColor
      ? {
          ...props.style,
          "--glow-color": glowColor,
        } as React.CSSProperties
      : props.style;

    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, blur, interactive }),
          animated && "animate-pulse-glow",
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-white dark:text-white",
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-200 dark:text-slate-300", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardFooter,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
};
