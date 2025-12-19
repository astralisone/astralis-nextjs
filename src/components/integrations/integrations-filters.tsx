"use client";

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface IntegrationsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: 'all' | 'connected' | 'available';
  onFilterChange: (filter: 'all' | 'connected' | 'available') => void;
  connectedCount: number;
  availableCount: number;
  totalCount: number;
}

export function IntegrationsFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  connectedCount,
  availableCount,
  totalCount,
}: IntegrationsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-hide">
        <Tabs value={filter} onValueChange={(val) => onFilterChange(val as any)} className="w-full">
          <TabsList className="inline-flex w-max sm:w-full">
            <TabsTrigger value="all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="connected">
              Connected ({connectedCount})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}