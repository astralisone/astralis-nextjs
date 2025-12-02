"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * MarketplaceSearch Component
 *
 * Central search interface with constellation effect and floating category icons.
 * Extracted from reference image showing AI Marketplace search.
 *
 * Visual Specifications:
 * - Dark navy background with particle/constellation effect
 * - Large centered search bar with glass/blur effect
 * - Category icons in circles below search (6-8 icons)
 * - Icons float/hover with subtle animation
 * - Connecting lines between icons (constellation)
 * - Cyan glow accents
 *
 * @example
 * ```tsx
 * <MarketplaceSearch
 *   onSearch={(query) => handleSearch(query)}
 *   categories={[
 *     { icon: Search, label: "Search" },
 *     { icon: Settings, label: "Configure" }
 *   ]}
 * />
 * ```
 */

export interface SearchCategory {
  /** Icon component */
  icon: LucideIcon;
  /** Category label */
  label: string;
  /** Click handler */
  onClick?: () => void;
}

export interface MarketplaceSearchProps {
  /** Search handler */
  onSearch: (query: string) => void;
  /** Category icons to display */
  categories?: SearchCategory[];
  /** Placeholder text */
  placeholder?: string;
  /** Show constellation effect */
  showConstellation?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const MarketplaceSearch = React.forwardRef<
  HTMLDivElement,
  MarketplaceSearchProps
>(
  (
    {
      onSearch,
      categories = [],
      placeholder = "Search",
      showConstellation = true,
      className,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchQuery);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center overflow-hidden",
          "bg-gradient-to-b from-astralis-navy via-slate-900 to-black",
          className
        )}
        {...props}
      >
        {/* Constellation/particle background */}
        {showConstellation && (
          <>
            {/* Floating particles */}
            <div className="absolute inset-0 opacity-40">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-astralis-cyan rounded-full animate-particle-float"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${4 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>

            {/* Connection lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lineGradient">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {categories.length > 1 &&
                categories.map((_, i) => {
                  if (i === categories.length - 1) return null;
                  const angle1 = (i * 360) / categories.length;
                  const angle2 = ((i + 1) * 360) / categories.length;
                  const x1 = 50 + 30 * Math.cos((angle1 * Math.PI) / 180);
                  const y1 = 50 + 30 * Math.sin((angle1 * Math.PI) / 180);
                  const x2 = 50 + 30 * Math.cos((angle2 * Math.PI) / 180);
                  const y2 = 50 + 30 * Math.sin((angle2 * Math.PI) / 180);
                  return (
                    <line
                      key={i}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="url(#lineGradient)"
                      strokeWidth="1"
                    />
                  );
                })}
            </svg>
          </>
        )}

        <div className="container mx-auto px-4 relative z-10">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <form onSubmit={handleSearch}>
              <div className="relative group">
                {/* Glass effect background */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-xl border border-astralis-cyan/30 group-hover:border-astralis-cyan/60 transition-colors duration-300" />

                <div className="relative flex items-center">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                      "flex-1 h-16 md:h-20 px-6 md:px-8 text-lg md:text-xl",
                      "bg-transparent border-0 text-white placeholder:text-slate-400",
                      "focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                  />

                  {/* Search icon button */}
                  <button
                    type="submit"
                    className={cn(
                      "absolute right-4 p-3 rounded-lg",
                      "bg-astralis-cyan hover:bg-astralis-cyan-600",
                      "text-white transition-all duration-300",
                      "shadow-glow-cyan hover:shadow-glow-cyan-lg"
                    )}
                  >
                    <SearchIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Category icons */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const angle = (index * 360) / categories.length;

                return (
                  <button
                    key={index}
                    onClick={category.onClick}
                    className={cn(
                      "group flex flex-col items-center gap-3",
                      "transition-all duration-300 hover:-translate-y-2"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-full",
                        "flex items-center justify-center",
                        "bg-astralis-cyan/10 border-2 border-astralis-cyan/50",
                        "group-hover:bg-astralis-cyan/20 group-hover:border-astralis-cyan",
                        "group-hover:shadow-glow-cyan transition-all duration-300",
                        "animate-float"
                      )}
                      style={{
                        animationDelay: `${index * 200}ms`,
                      }}
                    >
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-astralis-cyan" />
                    </div>

                    {/* Label */}
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors duration-300">
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    );
  }
);

MarketplaceSearch.displayName = "MarketplaceSearch";
