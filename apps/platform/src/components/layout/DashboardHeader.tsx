'use client';

import { Menu } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  /** Breadcrumb items for navigation */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  /** Callback to open mobile menu */
  onMobileMenuOpen?: () => void;
}

/**
 * DashboardHeader Component
 *
 * Top header bar for dashboard with:
 * - Mobile menu toggle
 * - Breadcrumb navigation
 */
export function DashboardHeader({ breadcrumbs, onMobileMenuOpen }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-white via-cyan-50/20 to-slate-50 border-b border-cyan-100/50 flex items-center gap-4 px-4 lg:px-6 py-3">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden md:block">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </header>
  );
}
