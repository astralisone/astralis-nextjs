"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IntegrationsHeaderProps {
  connectedCount: number;
  availableCount: number;
  totalCount: number;
  loading: boolean;
}

export function IntegrationsHeader({
  connectedCount,
  availableCount,
  totalCount,
  loading
}: IntegrationsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-astralis-navy">Integrations</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Connect your configured tools and services
          </p>
        </div>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {connectedCount} Connected
          </Badge>
          <Badge variant="default" className="px-3 py-1 text-xs">
            {availableCount} Available
          </Badge>
          <Badge variant="default" className="px-3 py-1 text-xs text-slate-500">
            {totalCount} Total
          </Badge>
        </div>
      )}
    </div>
  );
}