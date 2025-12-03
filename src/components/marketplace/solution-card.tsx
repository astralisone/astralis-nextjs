"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SolutionCard Component
 *
 * Card component for displaying marketplace solutions with ratings and badges.
 * Extracted from reference images showing featured solutions grid.
 *
 * Visual Specifications:
 * - White background card with subtle shadow
 * - Blue icon at top (circular container)
 * - Title (bold, navy)
 * - 5-star rating system (yellow/gray stars)
 * - Price or metric display
 * - "Featured" badge (cyan, top-right corner)
 * - "Learn More" button (cyan, bottom)
 * - Hover: lift effect + enhanced shadow
 *
 * @example
 * ```tsx
 * <SolutionCard
 *   icon={Zap}
 *   title="Predictive Analytics AI"
 *   rating={4.5}
 *   price="$99/mo"
 *   featured={true}
 *   description="Forecast customer behavior"
 *   onLearnMore={() => {}}
 * />
 * ```
 */

export interface SolutionCardProps {
  /** Icon component */
  icon: LucideIcon;
  /** Solution title */
  title: string;
  /** Rating (0-5) */
  rating?: number;
  /** Price or metric */
  price?: string;
  /** Short description */
  description?: string;
  /** Show featured badge */
  featured?: boolean;
  /** Badge text (default: "Featured") */
  badgeText?: string;
  /** Learn more click handler */
  onLearnMore?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const SolutionCard = React.forwardRef<HTMLDivElement, SolutionCardProps>(
  (
    {
      icon: Icon,
      title,
      rating,
      price,
      description,
      featured = false,
      badgeText = "Featured",
      onLearnMore,
      className,
      ...props
    },
    ref
  ) => {
    const renderStars = (rating: number) => {
      return [...Array(5)].map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 !== 0;

        return (
          <Star
            key={index}
            className={cn(
              " ui-icon w-5 h-5",
              filled
                ? "fill-yellow-400 text-yellow-400"
                : partial
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-slate-200 text-slate-200"
            )}
          />
        );
      });
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-white rounded-xl border border-slate-200 overflow-hidden",
          "transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-astralis-cyan/10",
          "flex flex-col h-full",
          className
        )}
        {...props}
      >
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-astralis-cyan text-white shadow-glow-cyan">
              {badgeText}
            </span>
          </div>
        )}

        {/* Card content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-astralis-blue/10 border-2 border-astralis-blue flex items-center justify-center">
              <Icon className="w-8 h-8 text-astralis-blue" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-astralis-navy mb-3">{title}</h3>

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">{renderStars(rating)}</div>
              <span className="text-sm text-slate-600">({rating.toFixed(1)})</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-3">
              {description}
            </p>
          )}

          {/* Price */}
          {price && (
            <div className="mb-4">
              <span className="text-2xl font-bold text-astralis-navy">{price}</span>
            </div>
          )}

          {/* Learn More button */}
          <Button
            onClick={onLearnMore}
            className="w-full bg-astralis-cyan hover:bg-astralis-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 mt-auto"
          >
            Learn More
          </Button>
        </div>
      </div>
    );
  }
);

SolutionCard.displayName = "SolutionCard";
