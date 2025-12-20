'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AgentChatWidget } from '@/components/agent/AgentChatWidget';
import { DebugPanelProvider } from '@/components/debug/DebugPanelProvider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

export function DashboardLayoutClient({
  user,
  children
}: {
  user: any;
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { rightPanelOpen } = useUIStore();

  return (
    <div className="fixed inset-0 top-[70px] flex bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <DashboardSidebar user={user} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <DashboardSidebar user={user} isMobile onClose={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        rightPanelOpen ? "mr-[400px]" : "mr-0"
      )}>
        <DashboardHeader user={user} onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      <AgentChatWidget />
      {/* Debug Panel - Available globally */}
      <DebugPanelProvider />
    </div>
  );
}
