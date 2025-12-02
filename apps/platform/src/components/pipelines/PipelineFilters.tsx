'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PipelineFilters as FilterType, PipelinePriority, PipelineItemStatus } from '@/types/pipelines';

interface PipelineFiltersProps {
  onFiltersChange: (filters: FilterType) => void;
}

const priorityOptions = [
  { value: PipelinePriority.NONE, label: 'None' },
  { value: PipelinePriority.LOW, label: 'Low' },
  { value: PipelinePriority.MEDIUM, label: 'Medium' },
  { value: PipelinePriority.HIGH, label: 'High' },
  { value: PipelinePriority.URGENT, label: 'Urgent' },
];

const statusOptions = [
  { value: PipelineItemStatus.NOT_STARTED, label: 'Not Started' },
  { value: PipelineItemStatus.IN_PROGRESS, label: 'In Progress' },
  { value: PipelineItemStatus.BLOCKED, label: 'Blocked' },
  { value: PipelineItemStatus.COMPLETED, label: 'Completed' },
];

export function PipelineFilters({ onFiltersChange }: PipelineFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState<FilterType>({
    search: searchParams.get('search') || '',
    priorities: [],
    statuses: [],
    tags: [],
  });

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: FilterType = {
      search: searchParams.get('search') || '',
      priorities: searchParams.get('priorities')?.split(',').map(Number).filter(Boolean) || [],
      statuses: searchParams.get('statuses')?.split(',') as PipelineItemStatus[] || [],
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    };
    setFilters(urlFilters);
    onFiltersChange(urlFilters);
  }, []);

  const updateFilters = (newFilters: FilterType) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.priorities && newFilters.priorities.length > 0) {
      params.set('priorities', newFilters.priorities.join(','));
    }
    if (newFilters.statuses && newFilters.statuses.length > 0) {
      params.set('statuses', newFilters.statuses.join(','));
    }
    if (newFilters.tags && newFilters.tags.length > 0) {
      params.set('tags', newFilters.tags.join(','));
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname, {
      scroll: false,
    });
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ ...filters, search: value });
  };

  const handlePriorityToggle = (priority: PipelinePriority) => {
    const priorities = filters.priorities || [];
    const newPriorities = priorities.includes(priority)
      ? priorities.filter((p) => p !== priority)
      : [...priorities, priority];
    updateFilters({ ...filters, priorities: newPriorities });
  };

  const handleStatusToggle = (status: PipelineItemStatus) => {
    const statuses = filters.statuses || [];
    const newStatuses = statuses.includes(status)
      ? statuses.filter((s) => s !== status)
      : [...statuses, status];
    updateFilters({ ...filters, statuses: newStatuses });
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterType = {
      search: '',
      priorities: [],
      statuses: [],
      tags: [],
    };
    updateFilters(emptyFilters);
    setIsOpen(false);
  };

  const activeFilterCount =
    (filters.priorities?.length || 0) +
    (filters.statuses?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search pipelines..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-astralis-blue text-white">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filter Pipelines</DialogTitle>
            <DialogDescription>
              Narrow down your pipeline view with filters
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Priority Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Priority</Label>
              <div className="grid grid-cols-2 gap-3">
                {priorityOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priorities?.includes(option.value)}
                      onCheckedChange={() => handlePriorityToggle(option.value)}
                    />
                    <Label
                      htmlFor={`priority-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Status</Label>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.statuses?.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <Label
                      htmlFor={`status-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
              >
                Clear All
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-slate-500 hover:text-slate-700"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
