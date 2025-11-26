'use client';

import * as React from 'react';
import Image from 'next/image';
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
      <nav className="mx-auto flex h-30 w-full max-w-[1400px] items-center p-5" aria-label="Main navigation">
        <div className="flex w-full items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-astralis-navy focus-visible:ring-astralis-blue"
              aria-label="Astralis home"
            >
              <Image
                src="/images/user-logo.jpeg"
                alt="Astralis logo"
                width={64}
                height={64}
                priority
                className="h-10 w-10 rounded-full border border-astralis-blue/60 object-cover drop-shadow-[0_14px_30px_rgba(43,108,176,0.35)] transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105"
              />
              <span className="text-2xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-astralis-blue group-focus-visible:text-astralis-blue">
                Astralis One
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="ml-auto hidden items-center gap-6 lg:flex">
            {/* Nav Links */}
            <ul className="flex items-center gap-6" role="list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative inline-block px-4 text-base font-medium transition-all duration-200',
                      'after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-astralis-blue after:opacity-0 after:content-[""] after:transition-transform after:duration-300 after:ease-out',
                      isActive(item.href)
                        ? 'text-white after:scale-x-100 after:opacity-100'
                        : 'text-slate-100 hover:text-white hover:after:scale-x-100 hover:after:opacity-100 focus-visible:text-white focus-visible:after:scale-x-100 focus-visible:after:opacity-100'
                    )}
                  >
                    {item.label}
                  </Link>

                </li>
              ))}
            </ul>

            {/* Sign In Button - Text Link Style */}
            <Link
              href="/auth/signin"
              className="text-base font-medium text-slate-100 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>

            {/* Start Service Wizard Button - Bright Blue Filled */}
            <Button
              variant="primary"
              size="sm"
              className="bg-astralis-blue hover:bg-blue-600 text-white font-semibold rounded-md transition-all duration-200"
              asChild
            >
              <Link href="/contact">Start Service Wizard</Link>
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
                          'block py-4 px-5 min-h-[44px] text-lg font-medium rounded-lg transition-all duration-200 flex items-center',
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

                {/* Sign In Link */}
                <Link
                  href="/auth/signin"
                  className="block py-4 px-5 mt-6 min-h-[44px] text-lg font-medium text-slate-100 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center justify-center border border-slate-600 hover:border-slate-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>

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
    </header>
  );
}
