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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-600 mt-2">
            Connect your configured tools and services
          </p>
        </div>
      </div>

      {!loading && (
        <div className="flex gap-4 mt-6">
          <Badge variant="secondary" className="px-3 py-1">
            {connectedCount} Connected
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {availableCount} Available
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-slate-500">
            {totalCount} Total
          </Badge>
        </div>
      )}
    </div>
  );
}