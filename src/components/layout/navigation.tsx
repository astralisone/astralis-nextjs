'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Navigation component following Astralis brand specification (Section 3.3)
 *
 * Desktop Navigation:
 * - Logo on the left
 * - Nav items on the right (Home, Solutions, AstralisOps, Marketplace, Contact)
 * - Active state: bottom slide-in underline animation (150-250ms)
 * - CTA button: "Talk to us" (primary button style)
 * - Max width: 1280px container
 * - Horizontal padding: 80-120px
 *
 * Mobile Navigation:
 * - Hamburger menu button
 * - Slide-out panel from right
 * - Link spacing: 24px
 * - Backdrop overlay
 * - Close animation on selection
 *
 * Styling:
 * - Astralis Navy (#0A1B2B) background
 * - Border bottom: slate-800
 * - Backdrop blur effect
 * - Sticky positioning
 */

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Products', href: '/astralisops' },
  { label: 'Services', href: '/services' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-astralis-navy border-b border-slate-700 shadow-lg">
      <nav className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-20 py-4" aria-label="Main navigation">
        <div className="flex h-24 items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex-shrink-0 py-2">
            <Link
              href="/"
              className="flex items-center text-2xl font-bold text-white transition-colors duration-200 hover:text-astralis-blue"
              aria-label="Astralis home"
            >
              ASTRALIS
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-10 lg:flex flex-1 justify-end">
            {/* Nav Links */}
            <ul className="flex items-center gap-10" role="list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative inline-block px-4 py-3 text-base font-medium transition-all duration-200',
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    )}
                  >
                    {item.label}
                    {/* Active underline animation */}
                    {isActive(item.href) && (
                      <span
                        className="absolute -bottom-1 left-0 h-0.5 w-full bg-astralis-blue"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA Button - Outlined Style */}
            <Button
              variant="outline"
              size="default"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-astralis-navy font-semibold px-8 py-3 rounded-md transition-all duration-200 ml-6"
              asChild
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-3 text-white transition-colors duration-200 hover:bg-slate-700 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="sr-only">
              {mobileMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
            {mobileMenuOpen ? (
              <X className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Menu className="h-7 w-7" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Panel */}
            <div
              id="mobile-menu"
              className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto bg-astralis-navy shadow-2xl animate-slide-in-right lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between border-b border-slate-700 p-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  type="button"
                  className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-7 w-7" aria-hidden="true" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="p-8">
                <ul className="flex flex-col gap-2" role="list">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block py-4 px-5 text-lg font-medium rounded-lg transition-all duration-200',
                          isActive(item.href)
                            ? 'text-white bg-slate-700'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Mobile CTA */}
                <div className="mt-10 pt-10 border-t border-slate-700">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-astralis-blue hover:bg-blue-600 font-semibold text-lg"
                    asChild
                  >
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      Contact
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          </>
        )}
      </nav>

      {/* Custom animation for mobile panel slide-in from right */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 250ms ease-out;
        }
      `}</style>
    </header>
  );
}
