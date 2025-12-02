'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from '@/components/automations/TemplateCard';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import type { AutomationTemplate, TemplateCategory } from '@/types/automation';

const categoryLabels: Record<TemplateCategory, string> = {
  LEAD_MANAGEMENT: 'Lead Management',
  CUSTOMER_ONBOARDING: 'Customer Onboarding',
  REPORTING: 'Reporting',
  NOTIFICATIONS: 'Notifications',
  DATA_SYNC: 'Data Sync',
  CONTENT_PUBLISHING: 'Content Publishing',
  INVOICING: 'Invoicing',
  SUPPORT_AUTOMATION: 'Support Automation',
  SALES_PIPELINE: 'Sales Pipeline',
  MARKETING: 'Marketing',
  HR_OPERATIONS: 'HR Operations',
  OTHER: 'Other',
};

type SortOption = 'popular' | 'newest' | 'rating';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automations/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.data || []); // API returns data.data, not data.templates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (templateId: string) => {
    try {
      const res = await fetch(`/api/automations/templates/${templateId}/deploy`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to deploy template');

      const data = await res.json();
      alert('Template deployed successfully!');
      router.push(`/automations/${data.automationId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deploy template');
    }
  };

  // Filter and sort templates
  const filteredTemplates = templates
    .filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' || template.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.useCount - a.useCount;
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/automations">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-astralis-navy">
                Automation Templates
              </h1>
              <p className="text-slate-600 mt-1">
                Browse and deploy pre-built automation workflows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-astralis-blue" />
            <span className="text-sm font-semibold text-astralis-blue">
              {templates.filter((t) => t.isOfficial).length} Official Templates
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(value: any) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
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
              <Card key={i} className="h-96">
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && !error && (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl">📋</div>
              <h3 className="text-xl font-bold text-astralis-navy">
                {searchQuery || categoryFilter !== 'all'
                  ? 'No templates found'
                  : 'No templates available'}
              </h3>
              <p className="text-slate-600">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Check back soon for new automation templates.'}
              </p>
              <Button variant="outline" asChild>
                <Link href="/automations">View Your Automations</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Templates Grid */}
        {!loading && filteredTemplates.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredTemplates.length} of {templates.length} template
                {templates.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDeploy={handleDeploy}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
