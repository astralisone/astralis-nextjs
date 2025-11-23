'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useDashboardStore } from '@/stores/dashboardStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgId: string;
  };
  children: React.ReactNode;
}

/**
 * DashboardLayoutClient Component
 *
 * Client-side dashboard shell that provides:
 * - Responsive sidebar (desktop: collapsible, mobile: drawer)
 * - Header with breadcrumbs and user menu
 * - Main content area
 * - Mobile menu state management
 */
export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useDashboardStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate breadcrumbs from pathname
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex flex-shrink-0">
        <DashboardSidebar user={user} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <DashboardSidebar
            user={user}
            isMobile
            onClose={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <DashboardHeader
          user={user}
          breadcrumbs={breadcrumbs}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Generate breadcrumbs from pathname
 *
 * Examples:
 * /dashboard -> [{ label: "Dashboard" }]
 * /pipelines -> [{ label: "Dashboard", href: "/dashboard" }, { label: "Pipelines" }]
 * /pipelines/123 -> [{ label: "Dashboard", href: "/dashboard" }, { label: "Pipelines", href: "/pipelines" }, { label: "Pipeline Details" }]
 */
function generateBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'dashboard') {
    return [{ label: 'Dashboard' }];
  }

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Format segment label (capitalize and remove hyphens)
    const label = formatSegmentLabel(segment);

    if (isLast) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  });

  return breadcrumbs;
}

/**
 * Format pathname segment into readable label
 */
function formatSegmentLabel(segment: string): string {
  // Handle specific segments
  const labelMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'pipelines': 'Pipelines',
    'intake': 'Intake',
    'documents': 'Documents',
    'scheduling': 'Scheduling',
    'automations': 'Automations',
    'settings': 'Settings',
  };

  if (labelMap[segment]) {
    return labelMap[segment];
  }

  // Check if it's a UUID or ID (contains numbers/hyphens)
  if (/^[0-9a-f-]+$/i.test(segment)) {
    return 'Details';
  }

  // Default: capitalize first letter and replace hyphens with spaces
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
