# @astralis/marketing

Static marketing website for Astralis One (www.astralisone.com).

## Overview

This is a standalone Next.js 15 application configured for static export. It contains no database dependencies and can be deployed to any static hosting service.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with static export
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: Shared from @astralis/ui workspace package
- **Port**: 3000 (dev)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build static export
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Build Output

The `npm run build` command generates a static export in the `/out` directory, which can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Pages

- `/` - Homepage with hero, features, CTA
- `/about` - Company information and values
- `/services` - Platform services and capabilities
- `/solutions` - Industry-specific solutions
- `/contact` - Contact form and information
- `/pricing` - Pricing tiers and FAQ

## Key Features

- **Static Export**: No server-side rendering, fully static HTML/CSS/JS
- **No Database**: Completely independent from the main app
- **Brand Consistent**: Uses Astralis design system colors and components
- **Responsive**: Mobile-first responsive design
- **Fast**: Optimized static pages with minimal JavaScript
- **SEO Friendly**: Proper metadata and semantic HTML

## Deployment

Since this is a static export, deployment is straightforward:

1. Build: `npm run build`
2. Upload `/out` directory to your hosting service
3. Configure your domain to point to the static files

## Links to Platform App

All CTAs and authentication links point to:
- Sign Up: `https://app.astralisone.com/auth/signup`
- Sign In: `https://app.astralisone.com/auth/signin`

These should be updated to match your actual app domain in production.

## Environment Variables

None required for static build. All configuration is compile-time.

## Important Notes

- This app runs on port 3000 (different from main app on 3001)
- Images are unoptimized for static export compatibility
- No API routes or server-side code
- Contact form is a placeholder (requires backend integration)
