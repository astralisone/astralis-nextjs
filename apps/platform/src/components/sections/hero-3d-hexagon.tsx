"use client";

/**
 * Hero3DHexagon Component
 *
 * 3D blue hexagonal wireframe graphics positioned on the RIGHT SIDE of the hero.
 * Creates a connected tech pattern with 3D blue hexagons forming geometric shapes.
 *
 * Design Specs:
 * - Positioned on the right side of hero (not scattered)
 * - 3D hexagonal shapes with wireframe styling
 * - Blue color scheme matching Astralis brand
 * - Connected nodes/lines creating tech pattern
 * - Subtle animation for depth
 */

export function Hero3DHexagon() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
      {/* Container for hexagonal pattern */}
      <div className="relative w-full h-full">
        {/* Main hexagonal structure */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Large hexagon */}
          <path
            d="M300 50 L450 137.5 L450 312.5 L300 400 L150 312.5 L150 137.5 Z"
            stroke="#2B6CB0"
            strokeWidth="2"
            fill="none"
            className="animate-pulse-slow"
          />

          {/* Medium hexagon - top right */}
          <path
            d="M375 125 L475 181.25 L475 293.75 L375 350 L275 293.75 L275 181.25 Z"
            stroke="#2B6CB0"
            strokeWidth="1.5"
            fill="none"
            className="animate-float"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Small hexagon - center */}
          <path
            d="M300 200 L350 225 L350 275 L300 300 L250 275 L250 225 Z"
            stroke="#3B82F6"
            strokeWidth="1.5"
            fill="rgba(43, 108, 176, 0.1)"
            className="animate-pulse"
          />

          {/* Connection lines between hexagons */}
          <line x1="300" y1="50" x2="300" y2="200" stroke="#2B6CB0" strokeWidth="1" opacity="0.5" />
          <line x1="450" y1="137.5" x2="375" y2="125" stroke="#2B6CB0" strokeWidth="1" opacity="0.5" />
          <line x1="450" y1="312.5" x2="475" y2="293.75" stroke="#2B6CB0" strokeWidth="1" opacity="0.5" />

          {/* Nodes at connection points */}
          <circle cx="300" cy="50" r="4" fill="#3B82F6" className="animate-pulse" />
          <circle cx="450" cy="137.5" r="4" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="450" cy="312.5" r="4" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="300" cy="400" r="4" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="150" cy="312.5" r="4" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="150" cy="137.5" r="4" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </svg>

        {/* Secondary hexagonal structure - lower position */}
        <svg
          className="absolute right-20 top-3/4 -translate-y-1/2 w-[400px] h-[400px] opacity-15"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medium hexagon */}
          <path
            d="M200 50 L300 100 L300 200 L200 250 L100 200 L100 100 Z"
            stroke="#2B6CB0"
            strokeWidth="1.5"
            fill="none"
            className="animate-float-slow"
            style={{ animationDelay: '1s' }}
          />

          {/* Inner hexagon */}
          <path
            d="M200 100 L250 125 L250 175 L200 200 L150 175 L150 125 Z"
            stroke="#3B82F6"
            strokeWidth="1"
            fill="rgba(43, 108, 176, 0.05)"
            className="animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />

          {/* Connection nodes */}
          <circle cx="200" cy="50" r="3" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="300" cy="100" r="3" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="300" cy="200" r="3" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
          <circle cx="200" cy="250" r="3" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
        </svg>

        {/* Floating particles for depth */}
        <div className="absolute right-32 top-1/4 w-2 h-2 bg-astralis-blue rounded-full opacity-60 animate-float" />
        <div className="absolute right-48 top-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 animate-float-slow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute right-24 top-2/3 w-2 h-2 bg-astralis-blue rounded-full opacity-50 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute right-56 top-1/2 w-1 h-1 bg-blue-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}
