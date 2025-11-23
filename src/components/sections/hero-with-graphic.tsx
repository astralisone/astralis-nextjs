"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * HeroWithTechGraphic Component
 *
 * Hero section with left content (heading, subheading, CTAs) and right 3D tech graphic.
 * Extracted from reference images showing dark navy backgrounds with cyan tech visuals.
 *
 * Visual Specifications:
 * - Dark navy background (#0A1B2B)
 * - Left: Large heading + subheading + 2 CTAs
 * - Right: 3D tech graphic (funnel, network, abstract)
 * - Particle dots in background
 * - Optional stats bar below
 * - Cyan primary CTA + white outline secondary CTA
 *
 * @example
 * ```tsx
 * <HeroWithTechGraphic
 *   title="AI-Driven Sales Automation"
 *   subtitle="Transform your sales intelligence"
 *   primaryCTA={{ text: "Launch Wizard", href: "#" }}
 *   secondaryCTA={{ text: "Book Demo", href: "/contact" }}
 *   graphicType="funnel"
 * />
 * ```
 */

export interface CTAButton {
  /** Button text */
  text: string;
  /** Button href or click handler */
  href?: string;
  /** Click handler if not using href */
  onClick?: () => void;
}

export interface HeroWithTechGraphicProps {
  /** Main heading */
  title: string;
  /** Subheading/description */
  subtitle: string;
  /** Primary CTA button */
  primaryCTA: CTAButton;
  /** Secondary CTA button */
  secondaryCTA?: CTAButton;
  /** Type of tech graphic to display */
  graphicType?: "funnel" | "network" | "abstract" | "custom";
  /** Custom graphic image path (when graphicType is 'custom') */
  customGraphic?: string;
  /** Show particle background effect */
  showParticles?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const HeroWithTechGraphic = React.forwardRef<
  HTMLElement,
  HeroWithTechGraphicProps
>(
  (
    {
      title,
      subtitle,
      primaryCTA,
      secondaryCTA,
      graphicType = "funnel",
      customGraphic,
      showParticles = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden",
          "bg-gradient-to-br from-astralis-navy via-slate-900 to-black",
          className
        )}
        {...props}
      >
        {/* Particle background effect */}
        {showParticles && (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-2 h-2 bg-astralis-cyan rounded-full animate-pulse-glow" />
            <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse-glow animation-delay-1000" />
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-astralis-cyan rounded-full animate-pulse-glow animation-delay-2000" />
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse-glow animation-delay-3000" />
            <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-astralis-cyan rounded-full animate-pulse-glow animation-delay-500" />
          </div>
        )}

        {/* Tech grid background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="text-white space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {title}
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryCTA && (
                  <Button
                    asChild={!!primaryCTA.href}
                    size="lg"
                    className="bg-astralis-cyan hover:bg-astralis-cyan-600 text-white font-bold shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all duration-300"
                    onClick={primaryCTA.onClick}
                  >
                    {primaryCTA.href ? (
                      <a href={primaryCTA.href}>{primaryCTA.text}</a>
                    ) : (
                      <span>{primaryCTA.text}</span>
                    )}
                  </Button>
                )}

                {secondaryCTA && (
                  <Button
                    asChild={!!secondaryCTA.href}
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-astralis-navy transition-all duration-300"
                    onClick={secondaryCTA.onClick}
                  >
                    {secondaryCTA.href ? (
                      <a href={secondaryCTA.href}>{secondaryCTA.text}</a>
                    ) : (
                      <span>{secondaryCTA.text}</span>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Right tech graphic */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
              {/* Glow effect behind graphic */}
              <div className="absolute inset-0 bg-gradient-radial from-astralis-cyan/20 via-transparent to-transparent blur-3xl" />

              {/* Tech graphic */}
              <div className="relative w-full h-full flex items-center justify-center">
                {customGraphic ? (
                  <Image
                    src={customGraphic}
                    alt="Tech graphic"
                    fill
                    className="object-contain animate-float-slow"
                  />
                ) : (
                  // Default SVG graphic based on type
                  <TechGraphic type={graphicType} />
                )}
              </div>

              {/* Animated connection lines */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-astralis-cyan to-transparent opacity-50" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-astralis-cyan to-transparent opacity-50" />
            </div>
          </div>
        </div>
      </section>
    );
  }
);

HeroWithTechGraphic.displayName = "HeroWithTechGraphic";

/**
 * TechGraphic Component
 * Renders different types of tech graphics (funnel, network, abstract)
 */
interface TechGraphicProps {
  type: "funnel" | "network" | "abstract" | "custom";
}

const TechGraphic: React.FC<TechGraphicProps> = ({ type }) => {
  if (type === "funnel") {
    return (
      <svg
        className="w-full h-full max-w-md animate-float-slow"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Funnel shape */}
        <path
          d="M100 50 L300 50 L250 200 L150 200 Z"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="url(#gradient1)"
          opacity="0.2"
        />
        <path
          d="M150 200 L250 200 L220 350 L180 350 Z"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="url(#gradient1)"
          opacity="0.3"
        />
        <path
          d="M180 350 L220 350 L210 450 L190 450 Z"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="url(#gradient1)"
          opacity="0.4"
        />

        {/* Connection nodes */}
        <circle cx="200" cy="50" r="6" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="200" cy="200" r="6" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="200" cy="350" r="6" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="200" cy="450" r="8" fill="#00D4FF" className="animate-glow-pulse" />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2B6CB0" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (type === "network") {
    return (
      <svg
        className="w-full h-full max-w-md"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Network nodes and connections */}
        <line x1="200" y1="50" x2="100" y2="150" stroke="#00D4FF" strokeWidth="2" opacity="0.5" />
        <line x1="200" y1="50" x2="300" y2="150" stroke="#00D4FF" strokeWidth="2" opacity="0.5" />
        <line x1="100" y1="150" x2="200" y2="250" stroke="#00D4FF" strokeWidth="2" opacity="0.5" />
        <line x1="300" y1="150" x2="200" y2="250" stroke="#00D4FF" strokeWidth="2" opacity="0.5" />
        <line x1="200" y1="250" x2="200" y2="350" stroke="#00D4FF" strokeWidth="2" opacity="0.5" />

        {/* Nodes */}
        <circle cx="200" cy="50" r="12" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="100" cy="150" r="10" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="300" cy="150" r="10" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="200" cy="250" r="14" fill="#00D4FF" className="animate-glow-pulse" />
        <circle cx="200" cy="350" r="10" fill="#00D4FF" className="animate-glow-pulse" />
      </svg>
    );
  }

  // Abstract geometric shape
  return (
    <svg
      className="w-full h-full max-w-md animate-rotate-slow"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Abstract hexagon with lines */}
      <polygon
        points="200,50 320,125 320,275 200,350 80,275 80,125"
        stroke="url(#gradient2)"
        strokeWidth="3"
        fill="none"
        className="animate-border-flow"
      />
      <polygon
        points="200,100 280,150 280,250 200,300 120,250 120,150"
        stroke="url(#gradient2)"
        strokeWidth="2"
        fill="url(#gradient2)"
        opacity="0.1"
      />

      {/* Center glow */}
      <circle cx="200" cy="200" r="30" fill="url(#gradient2)" opacity="0.3" className="animate-glow-pulse" />
      <circle cx="200" cy="200" r="15" fill="#00D4FF" className="animate-glow-pulse" />

      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#2B6CB0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
