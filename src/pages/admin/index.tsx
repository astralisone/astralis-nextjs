import React from 'react';
import { useApi } from "@/hooks/useApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingBag, FileText, Users, TrendingUp, Briefcase, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  marketplaceItems: number;
  blogPosts: number;
  users: number;
  totalViews: number;
  engagements?: {
    total: number;
    active: number;
    completed: number;
    totalRevenue: number;
  };
}

export default function AdminDashboardPage() {
  // Debug: Check authentication state
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Admin Dashboard - Token exists:', !!token);
    console.log('Admin Dashboard - User exists:', !!user);
    console.log('Admin Dashboard - Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('Admin Dashboard - User role:', parsedUser.role);
      } catch (e) {
        console.log('Admin Dashboard - Failed to parse user');
      }
    }
  }, []);

  // Fetch dashboard stats
  const { data, error, isLoading } = useApi<{ data: DashboardStats }>('/api/admin/dashboard');
  
  // Fetch engagement stats separately
  const { data: engagementData, isLoading: engagementLoading } = useApi<{ 
    data: { 
      overview: { 
        total: number; 
        active: number; 
        completed: number; 
        totalRevenue: number; 
      } 
    } 
  }>('/api/admin/engagements/stats');

  // Fallback data for development
  const stats = data?.data || {
    marketplaceItems: 0,
    blogPosts: 0,
    users: 0,
    totalViews: 0
  };

  const engagementStats = engagementData?.data?.overview || {
    total: 0,
    active: 0,
    completed: 0,
    totalRevenue: 0
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/engagements">
              <Briefcase className="w-4 h-4 mr-2" />
              Manage Engagements
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard 
          title="Total Engagements" 
          value={(engagementStats.total || 0).toString()} 
          description="Client projects" 
          icon={Briefcase}
          isLoading={engagementLoading}
          href="/admin/engagements"
        />
        <StatsCard 
          title="Active Projects" 
          value={(engagementStats.active || 0).toString()} 
          description="Currently running" 
          icon={TrendingUp}
          isLoading={engagementLoading}
          href="/admin/engagements?status=ACTIVE"
        />
        <StatsCard 
          title="Marketplace Items" 
          value={(stats.marketplaceItems || 0).toString()} 
          description="Total products" 
          icon={ShoppingBag}
          isLoading={isLoading}
          href="/admin/marketplace"
        />
        <StatsCard 
          title="Blog Posts" 
          value={(stats.blogPosts || 0).toString()} 
          description="Published articles" 
          icon={FileText}
          isLoading={isLoading}
          href="/admin/blog"
        />
        <StatsCard 
          title="Users" 
          value={(stats.users || 0).toString()} 
          description="Registered accounts" 
          icon={Users}
          isLoading={isLoading}
          href="/admin/users"
        />
      </div>

      {/* Revenue Card */}
      {(engagementStats.totalRevenue || 0) > 0 && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-400">Total Revenue</CardTitle>
              <CardDescription>From completed and active engagements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                ${(engagementStats.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-sm text-green-300/70 mt-1">
                {engagementStats.completed || 0} completed • {engagementStats.active || 0} active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="hover:bg-white/5 transition-colors cursor-pointer">
          <Link href="/onboarding" className="block p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Plus className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">New Client Onboarding</h3>
                <p className="text-sm text-gray-400">Start onboarding a new client</p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-white/5 transition-colors cursor-pointer">
          <Link href="/admin/engagements" className="block p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">View All Engagements</h3>
                <p className="text-sm text-gray-400">Manage client projects</p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-white/5 transition-colors cursor-pointer">
          <Link href="/admin/marketplace/new" className="block p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Add Marketplace Item</h3>
                <p className="text-sm text-gray-400">Create new product</p>
              </div>
            </div>
          </Link>
        </Card>
      </div>

      {/* Tabs for different data views */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="engagements">Recent Engagements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <p>Recent activity will be displayed here</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Engagements</CardTitle>
              <CardDescription>Latest client projects and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {engagementLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Recent engagements will be displayed here</p>
                  <Button asChild>
                    <Link href="/admin/engagements">View All Engagements</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Traffic and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <p>Analytics data will be displayed here</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  isLoading?: boolean;
  href?: string;
}

function StatsCard({ title, value, description, icon: Icon, isLoading, href }: StatsCardProps) {
  const content = (
    <Card className={href ? "hover:bg-white/5 transition-colors cursor-pointer" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
} 