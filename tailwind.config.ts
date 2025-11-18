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

        // Slate neutrals (from spec Section 2.3)
        slate: {
          50: "#F7FAFC",
          100: "#F7FAFC",
          300: "#E2E8F0",
          500: "#718096",
          700: "#2D3748",
          900: "#1A202C",
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

      // Box shadows for cards (per spec Section 3.3)
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",
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

      // Keyframes for subtle animations
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in": "slide-in 250ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
