"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * CaseStudyCard Component
 *
 * Featured case study card with dark tech background and prominent CTA.
 * Extracted from reference images showing case study showcases.
 *
 * Visual Specifications:
 * - Dark blue/navy card with tech background pattern
 * - White text
 * - Large bold title
 * - Subtitle or description
 * - Cyan "Read More" button with arrow
 * - Subtle tech graphic overlay
 * - Hover effects with glow
 *
 * @example
 * ```tsx
 * <CaseStudyCard
 *   title="Boosting Manufacturing Output by 40%"
 *   subtitle="with Predictive Maintenance AI"
 *   href="/case-studies/manufacturing"
 *   variant="dark-tech"
 * />
 * ```
 */

export interface CaseStudyCardProps {
  /** Case study title */
  title: string;
  /** Subtitle or tagline */
  subtitle?: string;
  /** Description text */
  description?: string;
  /** Link to full case study */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Visual variant */
  variant?: "dark-tech" | "light" | "gradient";
  /** CTA button text */
  ctaText?: string;
  /** Additional CSS classes */
  className?: string;
}

export const CaseStudyCard = React.forwardRef<HTMLDivElement, CaseStudyCardProps>(
  (
    {
      title,
      subtitle,
      description,
      href,
      onClick,
      variant = "dark-tech",
      ctaText = "Read More",
      className,
      ...props
    },
    ref
  ) => {
    const isDark = variant === "dark-tech" || variant === "gradient";

    const handleClick = () => {
      if (onClick) {
        onClick();
      } else if (href) {
        window.location.href = href;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl overflow-hidden p-8 md:p-10 lg:p-12 cursor-pointer group",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
          variant === "dark-tech" &&
            "bg-gradient-to-br from-astralis-navy via-slate-900 to-black",
          variant === "gradient" &&
            "bg-gradient-to-br from-astralis-blue to-astralis-cyan",
          variant === "light" && "bg-white border-2 border-slate-200",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Tech pattern background */}
        {variant === "dark-tech" && (
          <>
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-astralis-cyan/20 rounded-full blur-3xl group-hover:bg-astralis-cyan/30 transition-all duration-500" />

            {/* Circuit lines */}
            <svg
              className="absolute top-0 right-0 w-full h-full opacity-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0%"
                y1="20%"
                x2="100%"
                y2="20%"
                stroke="#00D4FF"
                strokeWidth="1"
                strokeDasharray="10,5"
              />
              <line
                x1="80%"
                y1="0%"
                x2="80%"
                y2="100%"
                stroke="#00D4FF"
                strokeWidth="1"
                strokeDasharray="10,5"
              />
              <circle cx="80%" cy="20%" r="3" fill="#00D4FF" />
            </svg>
          </>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <h3
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight",
              isDark ? "text-white" : "text-astralis-navy"
            )}
          >
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={cn(
                "text-xl md:text-2xl lg:text-3xl font-semibold mb-6",
                isDark ? "text-astralis-cyan" : "text-astralis-blue"
              )}
            >
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p
              className={cn(
                "text-base md:text-lg mb-8 max-w-2xl",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              {description}
            </p>
          )}

          {/* CTA Button */}
          <Button
            size="lg"
            className={cn(
              "font-bold transition-all duration-300 group-hover:scale-105",
              isDark
                ? "bg-astralis-cyan hover:bg-astralis-cyan-600 text-white shadow-glow-cyan hover:shadow-glow-cyan-lg"
                : "bg-astralis-blue hover:bg-astralis-blue/90 text-white"
            )}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    );
  }
);

CaseStudyCard.displayName = "CaseStudyCard";
