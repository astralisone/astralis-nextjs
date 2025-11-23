"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatsBar Component
 *
 * Displays a horizontal bar of statistics/metrics below hero sections.
 * Extracted from reference images showing metrics like "278% Higher Lead Conversion".
 *
 * Visual Specifications:
 * - Dark background strip (navy/black)
 * - 3-4 stat items horizontally arranged
 * - Large value text (white)
 * - Smaller label text (gray/white)
 * - Optional separators between items
 * - Responsive: stacks on mobile
 *
 * @example
 * ```tsx
 * <StatsBar
 *   stats={[
 *     { value: "278%", label: "Higher Lead Conversion" },
 *     { value: "40%", label: "Reduced Cycle by" }
 *   ]}
 *   variant="dark"
 * />
 * ```
 */

export interface Stat {
  /** Large metric value (e.g., "278%", "40%", "$1M+") */
  value: string;
  /** Description label */
  label: string;
  /** Optional prefix icon or text */
  prefix?: string;
}

export interface StatsBarProps {
  /** Array of statistics to display */
  stats: Stat[];
  /** Visual variant */
  variant?: "dark" | "light";
  /** Show separators between stats */
  showSeparators?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const StatsBar = React.forwardRef<HTMLDivElement, StatsBarProps>(
  ({ stats, variant = "dark", showSeparators = false, className, ...props }, ref) => {
    const isDark = variant === "dark";

    return (
      <div
        ref={ref}
        className={cn(
          "py-6 md:py-8",
          isDark
            ? "bg-gradient-to-r from-slate-900 via-astralis-navy to-slate-900"
            : "bg-slate-100",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-8 lg:gap-16 space-y-6 md:space-y-0">
            {stats.map((stat, index) => {
              const isLast = index === stats.length - 1;

              return (
                <React.Fragment key={index}>
                  {/* Stat item */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-baseline gap-1">
                      {stat.prefix && (
                        <span
                          className={cn(
                            "text-xl md:text-2xl font-semibold",
                            isDark ? "text-astralis-cyan" : "text-astralis-blue"
                          )}
                        >
                          {stat.prefix}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-3xl md:text-4xl lg:text-5xl font-bold",
                          isDark
                            ? "text-white bg-gradient-to-r from-white to-astralis-cyan bg-clip-text text-transparent"
                            : "text-astralis-navy"
                        )}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm md:text-base mt-2 max-w-xs",
                        isDark ? "text-slate-300" : "text-slate-600"
                      )}
                    >
                      {stat.label}
                    </p>
                  </div>

                  {/* Separator */}
                  {showSeparators && !isLast && (
                    <div
                      className={cn(
                        "hidden md:block w-px h-16",
                        isDark ? "bg-slate-700" : "bg-slate-300"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

StatsBar.displayName = "StatsBar";
