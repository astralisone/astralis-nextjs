"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/**
 * FeatureCardIcon Component
 *
 * Displays a feature with circular icon container, title, and description.
 * Used in grid layouts for service/feature showcases.
 * Extracted from reference images showing feature grids.
 *
 * Visual Specifications:
 * - Circular icon container (cyan/blue)
 * - Icon in white
 * - Title below (navy, bold)
 * - Description text (gray)
 * - Hover effects with lift
 * - Used in 3-4 column grids
 *
 * @example
 * ```tsx
 * <FeatureCardIcon
 *   icon={Target}
 *   title="Sales & Marketing Optimization"
 *   description="Scale faster with AI-driven solutions"
 *   variant="light"
 * />
 * ```
 */

export interface FeatureCardIconProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Visual variant */
  variant?: "light" | "dark";
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Enable hover effects */
  enableHover?: boolean;
}

export const FeatureCardIcon = React.forwardRef<
  HTMLDivElement,
  FeatureCardIconProps
>(
  (
    {
      icon: Icon,
      title,
      description,
      variant = "light",
      className,
      onClick,
      enableHover = true,
      ...props
    },
    ref
  ) => {
    const isDark = variant === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center text-center p-6 rounded-lg transition-all duration-300",
          enableHover && "hover:-translate-y-2 hover:shadow-lg cursor-pointer",
          isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Icon container */}
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
            isDark
              ? "bg-astralis-cyan/20 border-2 border-astralis-cyan"
              : "bg-astralis-blue/10 border-2 border-astralis-blue",
            enableHover && "group-hover:scale-110 group-hover:shadow-glow-cyan"
          )}
        >
          <Icon
            className={cn(
              "w-10 h-10",
              isDark ? "text-astralis-cyan" : "text-astralis-blue"
            )}
          />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "text-xl md:text-2xl font-bold mb-3",
            isDark ? "text-white" : "text-astralis-navy"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-sm md:text-base leading-relaxed",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {description}
        </p>
      </div>
    );
  }
);

FeatureCardIcon.displayName = "FeatureCardIcon";
