'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrgSwitcherProps {
  currentOrgId: string;
  variant?: 'header' | 'sidebar';
}

export function OrgSwitcher({ currentOrgId, variant = 'header' }: OrgSwitcherProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // In Phase 2, users only have one org
  // In future phases, fetch user's organizations from API
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
      router.push('/dashboard');
      setOpen(false);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full",
          variant === 'header'
            ? "hover:bg-slate-100"
            : "hover:bg-white/10 border border-white/20"
        )}
        aria-label="Organization switcher"
      >
        <Building className={cn(
          "h-5 w-5",
          variant === 'header' ? "text-slate-600" : "text-white"
        )} />
        <span className={cn(
          "text-sm font-medium flex-1 text-left truncate",
          variant === 'header' ? "text-slate-700" : "text-white"
        )}>
          {currentOrg?.name || 'Organization'}
        </span>
        <ChevronsUpDown className={cn(
          "h-5 w-5",
          variant === 'header' ? "text-slate-400" : "text-slate-300"
        )} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-2">
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
                  <Building className="h-5 w-5 text-slate-400" />
                  <span className="text-sm">{org.name}</span>
                </div>
                {org.id === currentOrgId && (
                  <Check className="h-5 w-5 text-astralis-blue" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
