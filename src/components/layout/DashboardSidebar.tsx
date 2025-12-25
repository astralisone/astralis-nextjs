'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatDistanceToNow } from 'date-fns';
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  LogOut,
  User,
  Puzzle,
  Shield,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrgSwitcher } from './OrgSwitcher';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgId: string;
    role?: string;
  };
  /** Whether this sidebar is in a mobile drawer */
  isMobile?: boolean;
  /** Callback to close mobile drawer */
  onClose?: () => void;
}

const navigation = [
  { name: 'Command Center', href: '/command-center', icon: LayoutDashboard },
  { name: 'Actions', href: '/admin/actions', icon: Activity },
  { name: 'Pipelines', href: '/pipelines', icon: GitBranch },
  { name: 'Intake', href: '/intake', icon: Inbox },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Scheduling', href: '/scheduling', icon: Calendar },
  { name: 'Automations', href: '/automations', icon: Zap },
  { name: 'Integrations', href: '/integrations', icon: Puzzle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  // Actions moved to main navigation
];

/**
 * DashboardSidebar Component
 */
export function DashboardSidebar({ user, isMobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const [activities, setActivities] = React.useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current || !navRef.current) return;

      const rect = scrollContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const height = rect.height;

      // Only scroll if mouse is within the sidebar area
      if (relativeY >= 0 && relativeY <= height) {
        const scrollRange = navRef.current.scrollHeight - navRef.current.clientHeight;
        if (scrollRange <= 0) return;

        // Proportional scroll: map 0..height to 0..scrollRange
        // Add a small dead-zone (10%) at top and bottom for stability
        const deadZone = 0.1;
        let factor = relativeY / height;

        if (factor < deadZone) factor = 0;
        else if (factor > (1 - deadZone)) factor = 1;
        else factor = (factor - deadZone) / (1 - 2 * deadZone);

        navRef.current.scrollTo({
          top: factor * scrollRange,
          behavior: 'auto'
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Fetch activities for notifications
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setActivities(data.recentActivity || []);
        }
      } catch (err) {
        console.error("Failed to fetch sidebar activities", err);
      }
    };

    fetchActivities();
  }, []);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'bg-gradient-to-b from-astralis-navy via-astralis-navy to-slate-900 text-white flex flex-col h-full border-r border-cyan-400/10',
        !isMobile && 'transition-all duration-300',
        !isMobile && (sidebarCollapsed ? 'w-20' : 'w-60')
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center py-3 border-b border-white/10",
        sidebarCollapsed && !isMobile ? "justify-center px-2" : "justify-between pl-6 pr-4"
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">AstralisOps</span>
          </Link>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Organization Switcher */}
      {(!sidebarCollapsed || isMobile) && (
        <div className="px-3 py-3 border-b border-white/10">
          <OrgSwitcher currentOrgId={user.orgId} variant="sidebar" />
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-astralis-blue text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!sidebarCollapsed || isMobile) && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {user.role === 'ADMIN' && adminNavigation.length > 0 && (
          <>
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {(!sidebarCollapsed || isMobile) ? 'Admin' : 'A'}
              </div>
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-astralis-blue text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!sidebarCollapsed || isMobile) && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10">
        {/* Notifications */}
        <div className={cn(
          "px-3 py-3 border-b border-white/10",
          sidebarCollapsed && !isMobile && "flex justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-300 hover:bg-white/10 hover:text-white relative",
                  sidebarCollapsed && !isMobile ? "justify-center" : "w-full"
                )}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 flex-shrink-0" />
                {(!sidebarCollapsed || isMobile) && <span className="font-medium">Notifications</span>}
                {activities.length > 0 && (
                  <Badge
                    variant="error"
                    className="absolute top-1 left-7 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                  >
                    {activities.length > 9 ? '9+' : activities.length}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-80">
              <DropdownMenuLabel>Recent Activities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {activities.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No new activities</div>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <DropdownMenuItem key={activity.id}>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              {activities.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-xs text-astralis-blue font-medium cursor-pointer" asChild>
                    <Link href="/dashboard">View All Activities</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile */}
        <div className={cn(
          "p-4",
          sidebarCollapsed && !isMobile && "flex justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 rounded-lg transition-colors hover:bg-white/10 p-2 -m-2",
                  sidebarCollapsed && !isMobile ? "justify-center" : "w-full"
                )}
                aria-label="User menu"
              >
                <div className="w-10 h-10 rounded-full bg-astralis-blue flex items-center justify-center flex-shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {(!sidebarCollapsed || isMobile) && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
