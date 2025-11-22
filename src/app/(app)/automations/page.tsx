'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AutomationCard } from '@/components/automations/AutomationCard';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import type { Automation, AutomationTrigger } from '@/types/automation';

export default function AutomationsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [triggerFilter, setTriggerFilter] = useState<AutomationTrigger | 'all'>('all');

  const fetchAutomations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automations');
      if (!res.ok) throw new Error('Failed to fetch automations');
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever we navigate to this page or when pathname/searchParams change
  useEffect(() => {
    fetchAutomations();
  }, [pathname, searchParams, fetchAutomations]);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error('Failed to toggle automation');

      setAutomations((prev) =>
        prev.map((auto) => (auto.id === id ? { ...auto, isActive } : auto))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle automation');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete automation');

      setAutomations((prev) => prev.filter((auto) => auto.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete automation');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      const res = await fetch(`/api/automations/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerData: {} }),
      });

      if (!res.ok) throw new Error('Failed to execute automation');

      const data = await res.json();
      alert('Automation executed successfully!');
      fetchAutomations(); // Refresh to get updated stats
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to execute automation');
    }
  };

  // Filter automations
  const filteredAutomations = automations.filter((auto) => {
    const matchesSearch =
      searchQuery === '' ||
      auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auto.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && auto.isActive) ||
      (statusFilter === 'inactive' && !auto.isActive);

    const matchesTrigger =
      triggerFilter === 'all' || auto.triggerType === triggerFilter;

    return matchesSearch && matchesStatus && matchesTrigger;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">Automations</h1>
            <p className="text-slate-600 mt-1">
              Manage your business automation workflows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={fetchAutomations}
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="primary" className="gap-2" asChild>
              <Link href="/automations/new">
                <Plus className="h-5 w-5" />
                Create Automation
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Trigger Type Filter */}
            <Select
              value={triggerFilter}
              onValueChange={(value: any) => setTriggerFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="WEBHOOK">Webhook</SelectItem>
                <SelectItem value="SCHEDULE">Schedule</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="API">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAutomations.length === 0 && !error && (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl">🤖</div>
              <h3 className="text-xl font-bold text-astralis-navy">
                {searchQuery || statusFilter !== 'all' || triggerFilter !== 'all'
                  ? 'No automations found'
                  : 'No automations yet'}
              </h3>
              <p className="text-slate-600">
                {searchQuery || statusFilter !== 'all' || triggerFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first automation workflow.'}
              </p>
              {!searchQuery && statusFilter === 'all' && triggerFilter === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button variant="primary" asChild>
                    <Link href="/automations/new">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Automation
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/automations/templates">Browse Templates</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Automations Grid */}
        {!loading && filteredAutomations.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredAutomations.length} of {automations.length} automation
                {automations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAutomations.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onExecute={handleExecute}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
