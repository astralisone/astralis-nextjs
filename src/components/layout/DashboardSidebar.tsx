'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  Zap,
  Bell,
  LogOut,
  User,
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
  };
  /** Whether this sidebar is in a mobile drawer */
  isMobile?: boolean;
  /** Callback to close mobile drawer */
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pipelines', href: '/pipelines', icon: GitBranch },
  { name: 'Intake', href: '/intake', icon: Inbox },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Scheduling', href: '/scheduling', icon: Calendar },
  { name: 'Automations', href: '/automations', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * DashboardSidebar Component
 *
 * Left sidebar navigation for dashboard with:
 * - Organization switcher
 * - Navigation menu with active state
 * - Collapsible on desktop
 * - Mobile drawer support
 * - Notifications and user profile section
 */
export function DashboardSidebar({ user, isMobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();

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
      className={cn(
        'bg-astralis-navy text-white flex flex-col h-full',
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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
      </nav>

      {/* Bottom Section: Notifications & User Profile */}
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
                <Badge
                  variant="error"
                  className="absolute top-1 left-7 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  3
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">New pipeline created</p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Document processed</p>
                  <p className="text-xs text-slate-500">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Meeting scheduled</p>
                  <p className="text-xs text-slate-500">3 hours ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile with Dropdown */}
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
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
