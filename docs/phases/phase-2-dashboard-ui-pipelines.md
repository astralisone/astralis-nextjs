# Phase 2: Dashboard UI & Pipelines

**Duration**: 2 weeks
**Prerequisites**: Phase 1 (Authentication & RBAC) complete
**Docker Changes**: None (pure frontend development)

---

## Phase Overview

This phase builds the complete authenticated dashboard UI for AstralisOps, including the main dashboard overview, Kanban-style pipeline management, and intake queue interface. By the end of this phase, operators can view and manage their work through a beautiful, brand-aligned interface.

### Success Criteria Checklist

- [ ] Authenticated users see dashboard after login
- [ ] Dashboard sidebar with navigation works
- [ ] Organization switcher functions properly
- [ ] Dashboard overview displays key metrics
- [ ] Kanban board shows pipelines with drag-and-drop
- [ ] Pipeline items can be moved between stages
- [ ] Intake queue displays requests with filters
- [ ] All components match Astralis brand design
- [ ] Loading states and error handling work
- [ ] Responsive design works on mobile/tablet
- [ ] All tests pass

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 15 (App Router), TypeScript 5, Prisma ORM, PostgreSQL, Redis, Docker
**Infrastructure**: DigitalOcean Droplet + Spaces (S3-compatible object storage)

**Brand Design System**:
- **Astralis Navy**: `#0A1B2B` (headings, sidebar, dark backgrounds)
- **Astralis Blue**: `#2B6CB0` (primary buttons, links, accents)
- **Status Colors**: Success `#38A169`, Warning `#DD6B20`, Error `#E53E3E`, Info `#3182CE`
- **Neutrals**: Slate palette (50-950)
- **Font**: Inter (via next/font/google)
- **Border Radius**: 6px (md), 8px (lg), 4px (sm)
- **Spacing**: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

**Database**: Multi-tenant architecture
- Organization → Users → Pipelines → PipelineItems
- Organization → IntakeRequests → Documents → SchedulingEvents

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) ← NEW IN THIS PHASE
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 2)

```yaml
Active Containers:
- app: Next.js application (port 3001)
  ├── Handles all web requests
  ├── Serves marketing pages and API routes
  ├── Includes NextAuth routes (Phase 1)
  └── Now includes dashboard UI routes (Phase 2)

- postgres: PostgreSQL 16 database
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  ├── Includes auth tables (Phase 1)
  └── Existing pipeline/intake tables used by dashboard

Volumes:
- postgres-data: Database persistence

Networks:
- astralis-network: Bridge network

Status: No Docker changes in this phase, extending frontend only
```

---

## Database Schema State (Phase 2 - No Changes)

Phase 2 uses existing database schema from Phase 1. No new tables or migrations required.

**Existing Tables Used**:
- **Organization**: For organization context and switching
- **User**: For current user info and role checks
- **Pipeline**: List pipelines for current organization
- **Stage**: Display stages in Kanban columns
- **PipelineItem**: Items displayed as Kanban cards
- **IntakeRequest**: Display in intake queue
- **ActivityLog**: Track all user actions

**Key Relationships**:
```
Organization (1) → (many) User
Organization (1) → (many) Pipeline
Pipeline (1) → (many) Stage
Stage (1) → (many) PipelineItem
Organization (1) → (many) IntakeRequest
```

---

## Environment Variables (Phase 2 - No Changes)

No new environment variables in this phase. Using existing from Phase 1:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"

# NextAuth.js (Phase 1)
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="<oauth-client-id>"
GOOGLE_CLIENT_SECRET="<oauth-client-secret>"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="<smtp-username>"
SMTP_PASSWORD="<smtp-password>"
SMTP_FROM_EMAIL="support@astralisone.com"

# API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

---

## File Structure (After Phase 2)

```
src/
├── app/
│   ├── (marketing)/              # Existing marketing pages
│   ├── (app)/                    # NEW: Authenticated dashboard
│   │   ├── layout.tsx           # Dashboard shell layout
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Overview page
│   │   ├── pipelines/
│   │   │   ├── page.tsx         # Pipeline list
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Kanban board
│   │   ├── intake/
│   │   │   ├── page.tsx         # Intake queue
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Request detail
│   │   └── settings/
│   │       └── page.tsx         # Settings (placeholder)
│   ├── api/                      # Existing API routes
│   ├── auth/                     # Phase 1 auth pages
│   ├── astralisops/              # Existing product page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   ├── ui/                       # Existing (Button, Input, Card, etc.)
│   ├── auth/                     # Phase 1 auth components
│   ├── dashboard/                # NEW: Dashboard components
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── StatsWidget.tsx
│   │   ├── DataTable.tsx
│   │   ├── IntakeQueueTable.tsx
│   │   └── PipelineList.tsx
│   ├── layout/
│   │   ├── Navigation.tsx       # Existing marketing nav
│   │   ├── DashboardSidebar.tsx # NEW
│   │   ├── DashboardHeader.tsx  # NEW
│   │   └── OrgSwitcher.tsx      # NEW
│   └── sections/                 # Existing
├── hooks/                        # NEW: Custom React hooks
│   ├── usePipelines.ts
│   ├── useIntake.ts
│   ├── useOrganization.ts
│   └── index.ts
├── lib/
│   ├── auth/                     # Phase 1
│   ├── middleware/               # Phase 1
│   ├── services/                 # Phase 1
│   ├── validators/               # Phase 1
│   ├── utils/
│   ├── prisma.ts
│   ├── email.ts
│   └── utils.ts
├── stores/                       # NEW: Zustand stores
│   ├── dashboardStore.ts
│   ├── pipelineStore.ts
│   └── index.ts
└── types/
    ├── next-auth.d.ts            # Phase 1
    └── dashboard.ts              # NEW: Dashboard types
```

---

## Implementation Steps

### Step 1: Install Frontend Dependencies

```bash
cd /home/deploy/astralis-nextjs

# Install state management
npm install zustand

# Install server state management
npm install @tanstack/react-query

# Install drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Install charts
npm install recharts

# Install date utilities
npm install date-fns

# Install icons (if not already)
npm install lucide-react

# Verify installation
npm list zustand @tanstack/react-query @dnd-kit/core recharts
```

### Step 2: Create TanStack Query Provider

Create `src/app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Update `src/app/layout.tsx` to include provider:

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Step 3: Create Zustand Store for Dashboard State

Create `src/stores/dashboardStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active Organization
  activeOrgId: string | null;
  setActiveOrgId: (orgId: string) => void;

  // Filters
  activeFilters: {
    status?: string;
    priority?: number;
    assignedTo?: string;
    dateRange?: { start: Date; end: Date };
  };
  updateFilters: (filters: Partial<DashboardState['activeFilters']>) => void;
  clearFilters: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      activeOrgId: null,
      setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),

      activeFilters: {},
      updateFilters: (filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        })),
      clearFilters: () => set({ activeFilters: {} }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeOrgId: state.activeOrgId,
      }),
    }
  )
);
```

### Step 4: Create Custom Hooks for Data Fetching

Create `src/hooks/usePipelines.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  orgId: string;
  stages: Stage[];
  _count?: { stages: number };
}

interface Stage {
  id: string;
  name: string;
  order: number;
  pipelineId: string;
  items: PipelineItem[];
}

interface PipelineItem {
  id: string;
  title: string;
  description?: string;
  data: any;
  priority: number;
  assignedTo?: string;
  tags: string[];
  stageId: string;
  createdAt: string;
  updatedAt: string;
}

export function usePipelines() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: ['pipelines', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/pipelines?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch pipelines');

      return response.json() as Promise<Pipeline[]>;
    },
    enabled: !!orgId,
    staleTime: 30000, // 30 seconds
  });
}

export function usePipeline(pipelineId: string) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      const response = await fetch(`/api/pipelines/${pipelineId}?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch pipeline');

      return response.json() as Promise<Pipeline>;
    },
    enabled: !!pipelineId && !!orgId,
    refetchInterval: 30000, // Refresh every 30s for real-time feel
  });
}

export function useMovePipelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      pipelineId,
      targetStageId,
    }: {
      itemId: string;
      pipelineId: string;
      targetStageId: string;
    }) => {
      const response = await fetch(`/api/pipelines/${pipelineId}/items/${itemId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStageId }),
      });

      if (!response.ok) throw new Error('Failed to move item');

      return response.json();
    },
    onMutate: async ({ itemId, pipelineId, targetStageId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pipeline', pipelineId] });

      // Snapshot previous value
      const previousPipeline = queryClient.getQueryData(['pipeline', pipelineId]);

      // Optimistically update
      queryClient.setQueryData(['pipeline', pipelineId], (old: any) => {
        if (!old) return old;

        const newStages = old.stages.map((stage: Stage) => {
          // Remove item from old stage
          const filteredItems = stage.items.filter((item: PipelineItem) => item.id !== itemId);

          // Add item to new stage
          if (stage.id === targetStageId) {
            const movedItem = old.stages
              .flatMap((s: Stage) => s.items)
              .find((item: PipelineItem) => item.id === itemId);

            if (movedItem) {
              return {
                ...stage,
                items: [...filteredItems, { ...movedItem, stageId: targetStageId }],
              };
            }
          }

          return { ...stage, items: filteredItems };
        });

        return { ...old, stages: newStages };
      });

      return { previousPipeline };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPipeline) {
        queryClient.setQueryData(['pipeline', variables.pipelineId], context.previousPipeline);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId] });
    },
  });
}
```

Create `src/hooks/useIntake.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface IntakeRequest {
  id: string;
  title: string;
  description?: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  requestData: any;
  assignedPipeline?: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export function useIntake(filters?: {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const queryParams = new URLSearchParams({
    orgId: orgId || '',
    ...(filters?.status && { status: filters.status }),
    ...(filters?.source && { source: filters.source }),
    ...(filters?.limit && { limit: filters.limit.toString() }),
    ...(filters?.offset && { offset: filters.offset.toString() }),
  });

  return useQuery({
    queryKey: ['intake', orgId, filters],
    queryFn: async () => {
      const response = await fetch(`/api/intake?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch intake requests');

      return response.json() as Promise<{
        requests: IntakeRequest[];
        total: number;
      }>;
    },
    enabled: !!orgId,
    staleTime: 10000, // 10 seconds
  });
}
```

### Step 5: Create Dashboard Layout

Create `src/app/(app)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar user={session.user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={session.user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Step 6: Create Dashboard Sidebar Component

Create `src/components/layout/DashboardSidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/astralisops/dashboard', icon: LayoutDashboard },
  { name: 'Intake', href: '/astralisops/intake', icon: Inbox },
  { name: 'Pipelines', href: '/astralisops/pipelines', icon: GitBranch },
  { name: 'Documents', href: '/astralisops/documents', icon: FileText },
  { name: 'Scheduling', href: '/astralisops/scheduling', icon: Calendar },
  { name: 'Settings', href: '/astralisops/settings', icon: Settings },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();

  return (
    <div
      className={cn(
        'bg-astralis-navy text-white transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <Link href="/astralisops/dashboard">
            <span className="text-xl font-bold">AstralisOps</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-astralis-blue text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-astralis-blue flex items-center justify-center flex-shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-lg font-semibold">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Create Dashboard Header Component

Create `src/components/layout/DashboardHeader.tsx`:

```typescript
'use client';

import { Bell, Search, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrgSwitcher } from './OrgSwitcher';

interface DashboardHeaderProps {
  user: {
    orgId: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        <OrgSwitcher currentOrgId={user.orgId} />

        {/* Notifications */}
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Sign Out */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
```

### Step 8: Create Organization Switcher

Create `src/components/layout/OrgSwitcher.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgSwitcherProps {
  currentOrgId: string;
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // In Phase 1, users only have one org
  // In future phases, fetch user's organizations
  const organizations = [
    {
      id: currentOrgId,
      name: session?.user?.name || 'My Organization',
    },
  ];

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  const handleOrgSwitch = async (orgId: string) => {
    if (orgId === currentOrgId) {
      setOpen(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/org/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) throw new Error('Failed to switch organization');

      // Refresh session and redirect
      router.refresh();
      router.push('/astralisops/dashboard');
      setOpen(false);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Building className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">
          {currentOrg?.name || 'Organization'}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-2">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              Organizations
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgSwitch(org.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors',
                  org.id === currentOrgId && 'bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{org.name}</span>
                </div>
                {org.id === currentOrgId && (
                  <Check className="w-4 h-4 text-astralis-blue" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

### Step 9: Create Dashboard Overview Page

Create `src/app/(app)/dashboard/page.tsx`:

```typescript
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { Inbox, GitBranch, FileText, CheckCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const orgId = session.user.orgId;

  // Fetch dashboard stats
  const [intakeStats, pipelineStats, documentStats] = await Promise.all([
    prisma.intakeRequest.groupBy({
      by: ['status'],
      where: { orgId },
      _count: true,
    }),
    prisma.pipeline.findMany({
      where: { orgId, isActive: true },
      include: {
        _count: {
          select: { stages: true },
        },
      },
    }),
    prisma.document.groupBy({
      by: ['status'],
      where: { orgId },
      _count: true,
    }),
  ]);

  const totalIntake = intakeStats.reduce((sum, stat) => sum + stat._count, 0);
  const newIntake = intakeStats.find((s) => s.status === 'NEW')?._count || 0;
  const totalPipelines = pipelineStats.length;
  const totalDocuments = documentStats.reduce((sum, stat) => sum + stat._count, 0);
  const processedDocuments = documentStats.find((s) => s.status === 'COMPLETED')?._count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {session.user.name || 'User'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="Total Intake Requests"
          value={totalIntake}
          change={{ value: newIntake, trend: 'up', period: 'new this week' }}
          icon={<Inbox className="w-6 h-6" />}
          variant="default"
        />

        <StatsWidget
          title="Active Pipelines"
          value={totalPipelines}
          icon={<GitBranch className="w-6 h-6" />}
          variant="default"
        />

        <StatsWidget
          title="Documents Processed"
          value={processedDocuments}
          change={{
            value: Math.round((processedDocuments / totalDocuments) * 100),
            trend: 'up',
            period: '% completion rate',
          }}
          icon={<FileText className="w-6 h-6" />}
          variant="success"
        />

        <StatsWidget
          title="Tasks Completed"
          value={0}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-astralis-navy mb-4">Recent Activity</h2>
        <p className="text-slate-500">No recent activity to display.</p>
      </div>
    </div>
  );
}
```

### Step 10: Create StatsWidget Component

Create `src/components/dashboard/StatsWidget.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
    period: string;
  };
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
};

export function StatsWidget({
  title,
  value,
  change,
  icon,
  variant = 'default',
}: StatsWidgetProps) {
  return (
    <Card variant="default" hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {icon && (
            <div className={cn('p-3 rounded-lg', variantStyles[variant])}>
              {icon}
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold text-astralis-navy">{value}</p>

          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.value}
              </span>
              <span className="text-sm text-slate-500">{change.period}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 11: Create Kanban Board for Pipelines

Create `src/app/(app)/pipelines/page.tsx`:

```typescript
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GitBranch } from 'lucide-react';

export default async function PipelinesPage() {
  const session = await auth();
  if (!session) return null;

  const pipelines = await prisma.pipeline.findMany({
    where: { orgId: session.user.orgId, isActive: true },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { stages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Pipelines</h1>
          <p className="text-slate-600 mt-1">Manage your workflow pipelines</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          New Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pipelines.map((pipeline) => (
          <Link key={pipeline.id} href={`/astralisops/pipelines/${pipeline.id}`}>
            <Card variant="default" hover>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-astralis-blue/10 rounded-lg">
                    <GitBranch className="w-5 h-5 text-astralis-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {pipeline._count.stages} stages
                    </p>
                  </div>
                </div>
              </CardHeader>
              {pipeline.description && (
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {pipeline.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}

        {pipelines.length === 0 && (
          <div className="col-span-full">
            <Card variant="default">
              <CardContent className="p-12 text-center">
                <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No pipelines yet
                </h3>
                <p className="text-slate-500 mb-4">
                  Create your first pipeline to get started
                </p>
                <Button variant="primary" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Pipeline
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
```

Create `src/app/(app)/pipelines/[id]/page.tsx`:

```typescript
'use client';

import { use } from 'react';
import { usePipeline } from '@/hooks/usePipelines';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pipeline, isLoading, error } = usePipeline(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load pipeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/astralisops/pipelines">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">{pipeline.name}</h1>
            {pipeline.description && (
              <p className="text-slate-600 mt-1">{pipeline.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard pipeline={pipeline} />
      </div>
    </div>
  );
}
```

### Step 12: Create Kanban Board Component

Create `src/components/dashboard/KanbanBoard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useMovePipelineItem } from '@/hooks/usePipelines';

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  order: number;
  items: PipelineItem[];
}

interface PipelineItem {
  id: string;
  title: string;
  description?: string;
  priority: number;
  tags: string[];
  stageId: string;
}

interface KanbanBoardProps {
  pipeline: Pipeline;
}

export function KanbanBoard({ pipeline }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const moveItem = useMovePipelineItem();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = pipeline.stages
      .flatMap((stage) => stage.items)
      .find((item) => item.id === active.id);

    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const itemId = active.id as string;
    const targetStageId = over.id as string;

    // Find current stage
    const currentStage = pipeline.stages.find((stage) =>
      stage.items.some((item) => item.id === itemId)
    );

    if (!currentStage || currentStage.id === targetStageId) {
      setActiveItem(null);
      return;
    }

    // Move item
    moveItem.mutate({
      itemId,
      pipelineId: pipeline.id,
      targetStageId,
    });

    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {pipeline.stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={stage.items}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

Create `src/components/dashboard/KanbanColumn.tsx`:

```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface PipelineItem {
  id: string;
  title: string;
  description?: string;
  priority: number;
  tags: string[];
  stageId: string;
}

interface KanbanColumnProps {
  stage: Stage;
  items: PipelineItem[];
}

export function KanbanColumn({ stage, items }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-slate-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-astralis-navy">{stage.name}</h3>
          <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded">
            {items.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'space-y-3 min-h-[200px] transition-colors',
            isOver && 'bg-astralis-blue/10 rounded-lg p-2'
          )}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Drop items here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/dashboard/KanbanCard.tsx`:

```typescript
'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PipelineItem {
  id: string;
  title: string;
  description?: string;
  priority: number;
  tags: string[];
}

interface KanbanCardProps {
  item: PipelineItem;
  isDragging?: boolean;
}

const priorityColors = {
  0: 'bg-slate-100 text-slate-600',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-orange-100 text-orange-600',
  3: 'bg-red-100 text-red-600',
};

export function KanbanCard({ item, isDragging = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-opacity',
        isDragging && 'opacity-50'
      )}
    >
      <Card variant="default" hover className="cursor-grab active:cursor-grabbing">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <button
              {...listeners}
              {...attributes}
              className="mt-1 text-slate-400 hover:text-slate-600"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-astralis-navy line-clamp-2">
                {item.title}
              </h4>

              {item.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.priority > 0 && (
                <div className="mt-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded font-medium',
                      priorityColors[item.priority as keyof typeof priorityColors] || priorityColors[0]
                    )}
                  >
                    P{item.priority}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 13: Create Intake Queue Page

Create `src/app/(app)/intake/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useIntake } from '@/hooks/useIntake';
import { IntakeQueueTable } from '@/components/dashboard/IntakeQueueTable';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

export default function IntakePage() {
  const [filters, setFilters] = useState<{
    status?: string;
    source?: string;
  }>({});

  const { data, isLoading, error } = useIntake(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Intake Queue</h1>
          <p className="text-slate-600 mt-1">Review and route incoming requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          Failed to load intake requests
        </div>
      ) : (
        <IntakeQueueTable requests={data?.requests || []} />
      )}
    </div>
  );
}
```

Create `src/components/dashboard/IntakeQueueTable.tsx`:

```typescript
'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IntakeRequest {
  id: string;
  title: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  createdAt: string;
}

interface IntakeQueueTableProps {
  requests: IntakeRequest[];
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-700',
  ROUTING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const sourceColors = {
  FORM: 'bg-slate-100 text-slate-700',
  EMAIL: 'bg-blue-100 text-blue-700',
  CHAT: 'bg-purple-100 text-purple-700',
  API: 'bg-green-100 text-green-700',
};

export function IntakeQueueTable({ requests }: IntakeQueueTableProps) {
  return (
    <Card variant="default">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-astralis-navy">
                    {request.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={sourceColors[request.source]}
                  >
                    {request.source}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={statusColors[request.status]}
                  >
                    {request.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  P{request.priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No intake requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

### Step 14: Add Badge Component

Create `src/components/ui/badge.tsx`:

```typescript
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

## Testing Checklist

### Manual Testing Steps

**1. Dashboard Layout**:
- [ ] Navigate to `/astralisops/dashboard` (requires authentication)
- [ ] Sidebar displays with all navigation items
- [ ] Sidebar collapse/expand works
- [ ] Header displays with search, org switcher, notifications
- [ ] User profile shows in sidebar
- [ ] Sign out button works

**2. Dashboard Overview**:
- [ ] Stats widgets display correct counts
- [ ] Widgets show icons and proper styling
- [ ] Change indicators display correctly
- [ ] Page is responsive on mobile

**3. Pipeline List**:
- [ ] Navigate to `/astralisops/pipelines`
- [ ] Pipelines display in grid layout
- [ ] Click pipeline navigates to Kanban view
- [ ] Empty state shows when no pipelines

**4. Kanban Board**:
- [ ] Navigate to specific pipeline
- [ ] Stages display in horizontal layout
- [ ] Pipeline items show in correct stages
- [ ] Drag item from one stage to another
- [ ] Item updates position optimistically
- [ ] Item persists in new stage after refresh
- [ ] Drag overlay shows during drag

**5. Intake Queue**:
- [ ] Navigate to `/astralisops/intake`
- [ ] Requests display in table
- [ ] Status and source badges show correct colors
- [ ] Table is sortable
- [ ] Filters work correctly
- [ ] Empty state shows when no requests

**6. Responsive Design**:
- [ ] Test on mobile (< 768px)
- [ ] Sidebar becomes overlay/drawer on mobile
- [ ] Kanban board scrolls horizontally on mobile
- [ ] Tables switch to card view on mobile
- [ ] All buttons have proper touch targets (44x44px)

**7. Loading States**:
- [ ] Dashboard shows loading skeleton
- [ ] Pipeline list shows loading spinner
- [ ] Kanban board shows loading state
- [ ] Intake queue shows loading state

**8. Error Handling**:
- [ ] Disconnect network and test error states
- [ ] API errors display user-friendly messages
- [ ] Retry buttons work correctly

---

## Handoff to Next Phase

### What's Complete

✅ **Dashboard UI**:
- Complete authenticated app shell layout
- Sidebar navigation with collapse/expand
- Dashboard header with search and org switcher
- Responsive design for mobile/tablet

✅ **Dashboard Overview**:
- Stats widgets with real data
- Recent activity section (placeholder)
- Proper data fetching from database

✅ **Pipeline Management**:
- Pipeline list view
- Kanban board with drag-and-drop
- Column and card components
- Optimistic updates for item movement
- Real-time data refresh

✅ **Intake Queue**:
- Table view with filters
- Status and source badges
- Date formatting
- Empty states

✅ **State Management**:
- Zustand for client state
- TanStack Query for server state
- Custom hooks for data fetching
- Optimistic updates

✅ **Components**:
- StatsWidget
- KanbanBoard, KanbanColumn, KanbanCard
- IntakeQueueTable
- DashboardSidebar, DashboardHeader
- OrgSwitcher
- Badge

### What's Next (Phase 3)

**AI Integration & Background Jobs**:
- Implement OpenAI GPT-4 routing engine
- Replace placeholder routing logic in intake API
- Set up BullMQ + Redis for job queues
- Create background worker for async processing
- Add AI confidence scoring and reasoning
- Build job dashboard UI

**Docker Changes**:
- Add Redis container
- Add worker container for background jobs

**New Dependencies**:
- OpenAI SDK
- BullMQ
- Redis client

### Docker State (No Changes Yet)

**Current Containers**:
- `app`: Next.js application (includes Phase 1 auth + Phase 2 dashboard UI)
- `postgres`: PostgreSQL 16 database (includes all data)

**Next Phase Will Add**:
- `redis`: Redis 7 for job queues and caching
- `worker`: Background job processor

### Environment Variables (No New Ones)

All environment variables from Phase 1 are still used.

**Next Phase Will Add**:
```bash
OPENAI_API_KEY="sk-..."
REDIS_URL="redis://redis:6379"
REDIS_PASSWORD="<generated-password>"
```

### Database State (No Changes)

No new migrations or schema changes in Phase 2.

Using existing tables:
- Organization, User, Pipeline, Stage, PipelineItem, IntakeRequest

**Next Phase Will Add**:
- Background job tracking (via BullMQ)
- AI routing metadata in IntakeRequest

---

**END OF PHASE 2 DOCUMENTATION**

This documentation is complete and self-contained. Any AI session can use this document to implement Phase 2 without requiring prior conversation context.
