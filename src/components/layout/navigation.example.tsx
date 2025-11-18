/**
 * Navigation Component Usage Examples
 *
 * This file demonstrates how to integrate the Navigation component
 * in both App Router and Pages Router contexts.
 */

// ============================================================================
// EXAMPLE 1: App Router Layout (Recommended for SEO pages)
// ============================================================================

/**
 * File: src/app/layout.tsx
 *
 * Use this pattern for the root layout in App Router.
 * The Navigation will be shared across all pages in the app directory.
 */

/*
import { Navigation } from '@/components/layout';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Astralis One',
  description: 'AI-driven operations and engineering platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Pages Router App Component
// ============================================================================

/**
 * File: src/pages/_app.tsx
 *
 * Use this pattern for Pages Router pages (admin dashboard, checkout, etc.)
 */

/*
import { Navigation } from '@/components/layout';
import type { AppProps } from 'next/app';
import '@/app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <Component {...pageProps} />
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 3: Conditional Navigation (Different nav for different sections)
// ============================================================================

/**
 * File: src/app/layout.tsx (with conditional logic)
 *
 * Use this if you need different navigation for different sections
 */

/*
'use client';

import { Navigation } from '@/components/layout';
import { usePathname } from 'next/navigation';

export function LayoutWithConditionalNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navigation />}
      {isAdminRoute && <AdminNavigation />} // Your admin-specific nav
      <main>{children}</main>
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 4: Navigation with Custom CTA
// ============================================================================

/**
 * If you need to customize the CTA button based on user state
 */

/*
'use client';

import { Navigation } from '@/components/layout';
import { useAuthStore } from '@/lib/store';

export function NavigationWithAuth() {
  const { user } = useAuthStore();

  // You would need to modify the Navigation component to accept props
  // for custom CTA. This is a conceptual example.

  return <Navigation ctaHref={user ? '/dashboard' : '/contact'} ctaLabel={user ? 'Dashboard' : 'Talk to us'} />;
}
*/

// ============================================================================
// EXAMPLE 5: Standalone Usage (Without Layout)
// ============================================================================

/**
 * File: src/app/special-page/page.tsx
 *
 * For pages that need navigation but aren't in the layout hierarchy
 */

/*
import { Navigation } from '@/components/layout';

export default function SpecialPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-[1280px] px-20 py-16 lg:px-[120px]">
        <h1 className="text-4xl font-bold">Special Page</h1>
        <p className="mt-4 text-lg">
          This page has its own navigation instance.
        </p>
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 6: With Custom Container (Matching Navigation Width)
// ============================================================================

/**
 * Use this pattern to ensure your page content aligns with the navigation
 */

/*
import { Navigation } from '@/components/layout';

export default function AlignedContentPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-[1280px] px-20 lg:px-[120px]">
        <section className="py-16">
          <h1 className="text-5xl font-bold text-slate-900">
            Content Aligned with Nav
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            This content container matches the navigation width and padding,
            creating a cohesive visual alignment.
          </p>
        </section>
      </main>
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 7: Testing the Navigation Component
// ============================================================================

/**
 * File: src/components/layout/__tests__/navigation.test.tsx
 *
 * Example test structure using React Testing Library
 */

/*
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navigation', () => {
  it('renders all navigation items', () => {
    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('AstralisOps')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<Navigation />);

    expect(screen.getByText('Talk to us')).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Navigation />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', () => {
    render(<Navigation />);

    // Open menu
    fireEvent.click(screen.getByLabelText('Open menu'));

    // Close menu
    fireEvent.click(screen.getByLabelText('Close menu'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
*/

// ============================================================================
// EXAMPLE 8: Storybook Story for Navigation
// ============================================================================

/**
 * File: src/components/layout/navigation.stories.tsx
 *
 * Example Storybook story for visual testing
 */

/*
import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Layout/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const ActiveState: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/solutions',
      },
    },
  },
};
*/

export {};
