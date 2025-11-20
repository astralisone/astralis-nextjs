import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Astralis Brand Colors (from spec)
        "astralis-navy": "#0A1B2B",
        "astralis-blue": "#2B6CB0",

        // Tech-focused accent colors - PRIMARY CYAN PALETTE
        "astralis-cyan": {
          DEFAULT: "#00D4FF",
          50: "#E5F9FF",
          100: "#CCF3FF",
          200: "#99E7FF",
          300: "#66DBFF",
          400: "#33CFFF",
          500: "#00D4FF", // Main cyan from mockups
          600: "#00A8CC",
          700: "#007D99",
          800: "#005266",
          900: "#002633",
        },

        // Legacy support (alias to astralis-cyan)
        "cyber-cyan": {
          DEFAULT: "#00D4FF",
          50: "#E5F9FF",
          100: "#CCF3FF",
          200: "#99E7FF",
          300: "#66DBFF",
          400: "#33CFFF",
          500: "#00D4FF",
          600: "#00A3CC",
          700: "#007A99",
          800: "#005266",
          900: "#002933",
        },

        // Tech glow colors (from reference images)
        "tech-glow": {
          cyan: "#00D4FF",
          blue: "#0099FF",
          purple: "#6B5BFF",
          white: "#FFFFFF",
        },

        "neon-blue": {
          DEFAULT: "#0EA5E9",
          glow: "rgba(14, 165, 233, 0.5)",
        },
        "electric-purple": {
          DEFAULT: "#A855F7",
          glow: "rgba(168, 85, 247, 0.5)",
        },

        // Background gradient colors (from mockups)
        "navy-gradient-start": "#0A1B2B",
        "navy-gradient-end": "#000000",
        "light-gradient": "#F5F5F5",

        // Base semantic colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Primary (mapped to Astralis Blue)
        primary: {
          DEFAULT: "#2B6CB0",
          foreground: "#ffffff",
        },

        // Secondary (Navy accents)
        secondary: {
          DEFAULT: "#0A1B2B",
          foreground: "#ffffff",
        },

        // Slate neutrals (complete Tailwind palette)
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        // Status colors (from spec Section 2.3)
        success: "#38A169",
        warning: "#DD6B20",
        error: "#E53E3E",
        info: "#3182CE",

        // Traditional semantic colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // Enhanced border radius (6px per spec)
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },

      // Animation timing (150-250ms per spec Section 2.2)
      transitionDuration: {
        DEFAULT: "150ms",
        fast: "150ms",
        normal: "200ms",
        slow: "250ms",
      },

      // Box shadows for cards and glows (matching reference images)
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",

        // Cyan glow effects (Image 1, 3, 4)
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)",
        "glow-cyan-lg": "0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.4)",
        "glow-cyan-xl": "0 0 40px rgba(0, 212, 255, 0.7), 0 0 80px rgba(0, 212, 255, 0.5), 0 0 120px rgba(0, 212, 255, 0.3)",

        // Blue glow effects (Image 2, 5, 6)
        "glow-blue": "0 0 20px rgba(43, 108, 176, 0.5), 0 0 40px rgba(43, 108, 176, 0.3)",
        "glow-blue-lg": "0 0 30px rgba(43, 108, 176, 0.6), 0 0 60px rgba(43, 108, 176, 0.4)",

        // Purple accent glow
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)",

        // Inner glows for depth
        "inner-glow-cyan": "inset 0 0 20px rgba(0, 212, 255, 0.2)",
        "inner-glow-blue": "inset 0 0 20px rgba(43, 108, 176, 0.2)",

        // Neon/ring effects (Image 1 central ring)
        "neon-cyan": "0 0 5px #00D4FF, 0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 40px #00D4FF",
        "neon-blue": "0 0 5px #2B6CB0, 0 0 10px #2B6CB0, 0 0 20px #2B6CB0",

        // Glass card shadow (Image 3, 4 glass elements)
        "card-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "card-glass-light": "0 4px 16px 0 rgba(0, 0, 0, 0.1)",

        // Lens flare effect (Image 4)
        "lens-flare": "0 0 60px rgba(255, 255, 255, 0.8), 0 0 100px rgba(0, 212, 255, 0.6)",
      },

      // Spacing scale (from spec Section 3.2)
      spacing: {
        '4': '0.25rem',   // 4px
        '8': '0.5rem',    // 8px
        '12': '0.75rem',  // 12px
        '16': '1rem',     // 16px
        '20': '1.25rem',  // 20px
        '24': '1.5rem',   // 24px
        '32': '2rem',     // 32px
        '48': '3rem',     // 48px
        '64': '4rem',     // 64px
        '96': '6rem',     // 96px
      },

      // Backdrop blur levels
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },

      // Background images for tech patterns (matching reference images)
      backgroundImage: {
        // Gradients
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        // Image 1: Dark radial gradient with navy center
        "gradient-radial-dark": "radial-gradient(circle at center, #0A1B2B 0%, #000000 100%)",
        "gradient-radial-navy": "radial-gradient(ellipse at center, #0A1B2B 0%, #051018 50%, #000000 100%)",

        // Image 4: Navy to light gradient
        "gradient-navy-to-light": "linear-gradient(135deg, #0A1B2B 0%, #1a3a52 25%, #8B95A1 75%, #E5E7EB 100%)",

        // Image 2, 5: Tech gradient backgrounds
        "gradient-tech": "linear-gradient(135deg, #0A1B2B 0%, #1a3a52 100%)",
        "gradient-tech-radial": "radial-gradient(ellipse at top, #1a3a52 0%, #0A1B2B 100%)",

        // Tech mesh/grid patterns (Image 1, 3, 4)
        "grid-pattern": "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        "grid-pattern-cyan": "linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)",

        // Particle/dot patterns (Image 1, 3, 4)
        "dot-pattern": "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
        "dot-pattern-cyan": "radial-gradient(circle, rgba(0, 212, 255, 0.3) 2px, transparent 2px)",

        // Tech patterns
        "tech-mesh": "url('/patterns/tech-mesh.svg')",
        "circuit-pattern": "url('/patterns/circuit.svg')",
        "hexagon-pattern": "url('/patterns/hexagon.svg')",

        // Constellation network (Image 3)
        "constellation": `radial-gradient(2px 2px at 20% 30%, rgba(0, 212, 255, 0.4), transparent),
                          radial-gradient(2px 2px at 60% 70%, rgba(0, 212, 255, 0.4), transparent),
                          radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.3), transparent),
                          radial-gradient(1px 1px at 80% 10%, rgba(0, 212, 255, 0.3), transparent),
                          radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.2), transparent),
                          radial-gradient(1px 1px at 33% 80%, rgba(0, 212, 255, 0.3), transparent)`,
      },

      // Keyframes for animations
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.3)",
            opacity: "0.9",
          },
        },
        "glow-pulse-blue": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(43, 108, 176, 0.4), 0 0 40px rgba(43, 108, 176, 0.2)",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(43, 108, 176, 0.6), 0 0 60px rgba(43, 108, 176, 0.3)",
            opacity: "0.9",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "particle-float": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "0.3",
          },
          "33%": {
            transform: "translate(10px, -10px) scale(1.1)",
            opacity: "0.6",
          },
          "66%": {
            transform: "translate(-5px, 5px) scale(0.9)",
            opacity: "0.4",
          },
        },
        // Particle stream animation (Image 4 - flowing particles)
        "particle-stream": {
          "0%": {
            transform: "translate(-100%, 0) scale(0)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
            transform: "translate(-50%, -10px) scale(1)",
          },
          "90%": {
            opacity: "1",
            transform: "translate(50%, 10px) scale(1)",
          },
          "100%": {
            transform: "translate(100%, 0) scale(0)",
            opacity: "0",
          },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Icon orbit animation (Image 1 - floating tech icons)
        "orbit": {
          "0%": {
            transform: "rotate(0deg) translateX(100px) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateX(100px) rotate(-360deg)",
          },
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "border-flow": {
          "0%, 100%": {
            borderColor: "rgba(0, 212, 255, 0.3)",
          },
          "50%": {
            borderColor: "rgba(0, 212, 255, 0.8)",
          },
        },
        // Ring pulse (Image 1 - central AI ring)
        "ring-pulse": {
          "0%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(0, 212, 255, 0.7)",
          },
          "70%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 10px rgba(0, 212, 255, 0)",
          },
          "100%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(0, 212, 255, 0)",
          },
        },
        // Lens flare (Image 4)
        "lens-flare": {
          "0%, 100%": {
            opacity: "0.4",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.2)",
          },
        },
        // Connection line draw
        "draw-line": {
          "0%": {
            strokeDashoffset: "1000",
          },
          "100%": {
            strokeDashoffset: "0",
          },
        },
        // Slide animations for step wizard
        "slide-in-right": {
          "0%": {
            transform: "translateX(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(-20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in": "slide-in 250ms ease-out",

        // Glow animations (Images 1, 2, 3, 4)
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "glow-pulse-blue": "glow-pulse-blue 2s ease-in-out infinite",

        // Float animations (Image 1 - floating icons)
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",

        // Pulse effects
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        // Shimmer and scan effects
        "shimmer": "shimmer 3s linear infinite",
        "scan-line": "scan-line 8s linear infinite",

        // Particle animations (Images 1, 3, 4)
        "particle-float": "particle-float 4s ease-in-out infinite",
        "particle-stream": "particle-stream 15s linear infinite",

        // Rotation (Image 1 - orbiting icons)
        "rotate-slow": "rotate-slow 20s linear infinite",
        "orbit": "orbit 30s linear infinite",

        // Scale and border effects
        "scale-pulse": "scale-pulse 2s ease-in-out infinite",
        "border-flow": "border-flow 3s ease-in-out infinite",

        // Special effects (Image 1, 4)
        "ring-pulse": "ring-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "lens-flare": "lens-flare 3s ease-in-out infinite",
        "draw-line": "draw-line 2s ease-out forwards",

        // Slide transitions
        "slide-in-right": "slide-in-right 300ms ease-out",
        "slide-in-left": "slide-in-left 300ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
