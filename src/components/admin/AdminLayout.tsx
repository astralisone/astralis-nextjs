"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  LogOut,
  Briefcase,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin"
    },
    {
      href: "/admin/engagements",
      label: "Engagements",
      icon: Briefcase,
      active: pathname?.startsWith("/admin/engagements") || false
    },
    {
      href: "/admin/marketplace",
      label: "Marketplace",
      icon: ShoppingBag,
      active: pathname?.startsWith("/admin/marketplace") || false
    },
    {
      href: "/admin/blog",
      label: "Blog",
      icon: FileText,
      active: pathname?.startsWith("/admin/blog") || false
    },
    {
      href: "/admin/newsletter",
      label: "Newsletter",
      icon: Mail,
      active: pathname?.startsWith("/admin/newsletter") || false
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: pathname?.startsWith("/admin/users") || false
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname?.startsWith("/admin/settings") || false
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-white/5 backdrop-blur-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Admin Panel</h1>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-200",
                      item.active
                        ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto">
          <Button variant="outline" className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-500/10 hover:border-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
