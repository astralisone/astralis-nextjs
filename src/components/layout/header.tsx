"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, Bell, LogOut, Settings, ChevronDown, Zap, BarChart3, MessageSquare, TrendingUp, FileText, Calendar, Target } from 'lucide-react';
import { ModeToggle } from '@/components/layout/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  isAuthenticated?: boolean;
  notifications?: Array<{ id: number; message: string }>;
  unreadCount?: number;
  isLoading?: boolean;
}

export function Header({
  user,
  isAuthenticated = false,
  notifications = [],
  unreadCount = 0,
  isLoading = false,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'Services',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        {
          name: 'Customer Service Automation',
          href: '/services/customer-service',
          icon: MessageSquare,
          description: 'AI-powered customer support solutions'
        },
        {
          name: 'Sales Pipeline Optimization',
          href: '/services/sales-pipeline',
          icon: TrendingUp,
          description: 'Streamline your sales process'
        },
        {
          name: 'Content Generation',
          href: '/services/content-generation',
          icon: FileText,
          description: 'AI-powered content creation'
        },
        {
          name: 'Data Analytics',
          href: '/services/data-analytics',
          icon: BarChart3,
          description: 'Advanced data insights and reporting'
        },
        {
          name: 'Service Wizard',
          href: '/services/wizard',
          icon: Zap,
          description: 'Find the perfect service for your needs'
        }
      ]
    },
    { name: 'Process', href: '/process' },
    { name: 'Blog', href: '/blog' },
    { name: 'Marketplace', href: '/marketplace' },
    {
      name: 'Book',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        {
          name: 'Book Consultation',
          href: '/book-consultation',
          icon: Calendar,
          description: 'Schedule a strategic consultation'
        },
        {
          name: 'Book Revenue Audit',
          href: '/book-revenue-audit',
          icon: Target,
          description: 'Comprehensive revenue analysis'
        }
      ]
    },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Sign out', href: '/logout', icon: LogOut },
  ];

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full glass-elevated backdrop-blur-xl border-b border-border/30 shadow-glass">
        <div className="container flex h-16 items-center animate-pulse">
          <div className="h-6 w-32 bg-surface rounded-lg" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-elevated backdrop-blur-xl border-b border-border/30 shadow-glass">
      <div className="container flex h-16 items-center">
        <div className="mr-6 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-primary-glow group-hover:scale-105 transition-transform duration-200"></div>
            <span className="font-bold text-xl gradient-text hidden sm:inline-block">
              Astralis Agency
            </span>
          </Link>
           <nav className="flex items-center space-x-8 text-sm font-semibold">
             {navigation.map((item) => {
               if (item.hasDropdown && item.dropdownItems) {
                 return (
                   <DropdownMenu key={item.name}>
                     <DropdownMenuTrigger asChild>
                       <Button
                         variant="ghost"
                         className={cn(
                           "transition-all duration-200 hover:text-primary hover:scale-105 relative flex items-center gap-1 px-3 py-2",
                           "text-neutral-300 hover:text-foreground"
                         )}
                       >
                         {item.name}
                         <ChevronDown className="h-4 w-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="w-80 glass-elevated backdrop-blur-xl border border-border/30">
                       <DropdownMenuLabel className="text-base font-bold">{item.name}</DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       {item.dropdownItems.map((dropdownItem) => (
                         <DropdownMenuItem key={dropdownItem.href} asChild className="p-3">
                           <Link
                             href={dropdownItem.href}
                             className="flex items-start gap-3 w-full cursor-pointer"
                           >
                             <dropdownItem.icon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                             <div className="flex-1">
                               <div className="font-medium">{dropdownItem.name}</div>
                               <div className="text-sm text-neutral-400 mt-1">{dropdownItem.description}</div>
                             </div>
                           </Link>
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 );
               }

               return (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={cn(
                     "transition-all duration-200 hover:text-primary hover:scale-105 relative",
                     pathname === item.href
                       ? "text-primary"
                       : "text-neutral-300 hover:text-foreground"
                   )}
                 >
                   {item.name}
                   {pathname === item.href && (
                     <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                   )}
                 </Link>
               );
             })}
           </nav>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="glass"
              size="icon"
              className="mr-3 md:hidden shadow-glass"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-elevated backdrop-blur-xl border-r border-border/30">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-primary-glow"></div>
              <span className="font-bold text-xl gradient-text">Astralis</span>
            </div>
            <nav className="grid gap-4">
               {navigation.map((item) => {
                 if (item.hasDropdown && item.dropdownItems) {
                   return (
                     <div key={item.name} className="space-y-2">
                       <div className="px-4 py-2 text-base font-semibold text-primary border-b border-white/10">
                         {item.name}
                       </div>
                       {item.dropdownItems.map((dropdownItem) => (
                         <Link
                           key={dropdownItem.href}
                           href={dropdownItem.href}
                           className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium rounded-xl glass border border-white/10 hover:border-primary/30 transition-all duration-200"
                           onClick={() => setIsMobileMenuOpen(false)}
                         >
                           <dropdownItem.icon className="h-4 w-4 text-primary" />
                           <div>
                             <div>{dropdownItem.name}</div>
                             <div className="text-xs text-neutral-400">{dropdownItem.description}</div>
                           </div>
                         </Link>
                       ))}
                     </div>
                   );
                 }

                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className="flex w-full items-center py-3 px-4 text-base font-semibold rounded-xl glass border border-white/10 hover:border-primary/30 transition-all duration-200"
                     onClick={() => setIsMobileMenuOpen(false)}
                   >
                     {item.name}
                   </Link>
                 );
               })}
             </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search functionality here if needed */}
          </div>
          <nav className="flex items-center space-x-3">
            {isAuthenticated && notifications.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="icon" className="relative shadow-glass">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs font-bold shadow-primary-glow"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-elevated backdrop-blur-xl border border-border/30">
                  <DropdownMenuLabel className="text-base font-bold">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-4">
                      {notification.message}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ModeToggle />

            {/* TODO: Add CartSheet component once migrated from original project */}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="glass"
                    className="relative h-10 w-10 rounded-xl shadow-glass"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-elevated backdrop-blur-xl border border-border/30">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-base font-bold leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm leading-none text-neutral-400">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="p-3">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="font-medium">{item.name}</span>
                        <item.icon className="h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="px-6">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
