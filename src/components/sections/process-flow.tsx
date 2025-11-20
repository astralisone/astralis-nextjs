"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";

/**
 * ProcessFlow Component
 *
 * Displays a horizontal process flow with connected steps, arrows, and descriptions.
 * Extracted from reference images showing "Our Proven Process" sections.
 *
 * Visual Specifications:
 * - Horizontal row of circular icon containers
 * - Connecting arrows between steps
 * - Each step: icon + title + description
 * - Dark navy background variant
 * - Cyan glow effects on icons
 * - White text for dark variant
 *
 * @example
 * ```tsx
 * <ProcessFlow
 *   title="Our Proven Process"
 *   subtitle="Ready to Transform Your Business?"
 *   steps={[
 *     { icon: Search, title: "Browse & Strategy", description: "Discover opportunities" },
 *     { icon: Wrench, title: "Design & Optimize", description: "Create solutions" }
 *   ]}
 *   variant="dark"
 * />
 * ```
 */

export interface ProcessStep {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
}

export interface ProcessFlowProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of process steps */
  steps: ProcessStep[];
  /** Visual variant */
  variant?: "dark" | "light";
  /** Additional CSS classes */
  className?: string;
  /** Show connecting arrows */
  showArrows?: boolean;
  /** Enable icon glow effect */
  enableGlow?: boolean;
}

export const ProcessFlow = React.forwardRef<HTMLElement, ProcessFlowProps>(
  (
    {
      title,
      subtitle,
      steps,
      variant = "dark",
      className,
      showArrows = true,
      enableGlow = true,
      ...props
    },
    ref
  ) => {
    const isDark = variant === "dark";

    return (
      <section
        ref={ref}
        className={cn(
          "py-16 md:py-24",
          isDark
            ? "bg-gradient-to-b from-astralis-navy to-navy-gradient-end text-white"
            : "bg-white text-slate-900",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-12 md:mb-16">
              {title && (
                <h2
                  className={cn(
                    "text-3xl md:text-4xl lg:text-5xl font-bold mb-4",
                    isDark ? "text-white" : "text-astralis-navy"
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "text-lg md:text-xl max-w-2xl mx-auto",
                    isDark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Process Steps */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;

                return (
                  <div key={index} className="relative flex flex-col items-center">
                    {/* Arrow connector - desktop only */}
                    {showArrows && !isLast && (
                      <div className="hidden lg:block absolute top-12 left-1/2 w-full z-0">
                        <ArrowRight
                          className={cn(
                            "w-8 h-8 ml-8",
                            isDark ? "text-astralis-cyan" : "text-astralis-blue"
                          )}
                        />
                      </div>
                    )}

                    {/* Step content */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      {/* Icon container */}
                      <div
                        className={cn(
                          "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                          isDark
                            ? "bg-astralis-navy border-2 border-astralis-cyan"
                            : "bg-white border-2 border-astralis-blue shadow-md",
                          enableGlow && isDark && "shadow-glow-cyan",
                          "hover:scale-110 hover:shadow-glow-cyan-lg"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-12 h-12",
                            isDark ? "text-astralis-cyan" : "text-astralis-blue"
                          )}
                        />
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          "text-lg md:text-xl font-bold mb-2",
                          isDark ? "text-white" : "text-astralis-navy"
                        )}
                      >
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={cn(
                          "text-sm md:text-base max-w-xs",
                          isDark ? "text-slate-300" : "text-slate-600"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

ProcessFlow.displayName = "ProcessFlow";
