'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Eye, Download, RotateCw } from 'lucide-react';
import type { WorkflowExecution } from '@/types/automation';

interface ExecutionHistoryProps {
  automationId: string;
  executions: WorkflowExecution[];
  isLoading?: boolean;
  error?: string | null;
  onViewDetails?: (execution: WorkflowExecution) => void;
  onRetry?: (executionId: string) => void;
  onExport?: () => void;
}

const statusColors = {
  QUEUED: 'default',
  RUNNING: 'primary',
  SUCCESS: 'success',
  FAILED: 'error',
  TIMEOUT: 'warning',
  CANCELLED: 'default',
} as const;

export function ExecutionHistory({
  automationId,
  executions,
  isLoading = false,
  error = null,
  onViewDetails,
  onRetry,
  onExport,
}: ExecutionHistoryProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredExecutions = selectedStatus
    ? executions.filter((exec) => exec.status === selectedStatus)
    : executions;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border border-slate-200 rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-slate-200 last:border-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" showIcon>
        <AlertTitle>Error Loading Execution History</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-slate-200 rounded-lg">
        <p className="text-slate-600 mb-4">No executions yet</p>
        <p className="text-sm text-slate-500">
          This automation hasn't been executed. Try running it manually or wait for a trigger event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedStatus === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(null)}
          >
            All ({executions.length})
          </Button>
          <Button
            variant={selectedStatus === 'SUCCESS' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('SUCCESS')}
          >
            Success ({executions.filter((e) => e.status === 'SUCCESS').length})
          </Button>
          <Button
            variant={selectedStatus === 'FAILED' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('FAILED')}
          >
            Failed ({executions.filter((e) => e.status === 'FAILED').length})
          </Button>
        </div>

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className=" ui-icon w-5 h-5 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Started At</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Trigger Data</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExecutions.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell>
                  <Badge variant={statusColors[execution.status]}>
                    {execution.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-sm">
                      {new Date(execution.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(execution.startedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {execution.executionTime ? (
                    <span>
                      {execution.executionTime < 1000
                        ? `${execution.executionTime}ms`
                        : `${(execution.executionTime / 1000).toFixed(2)}s`}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-xs text-slate-500 max-w-xs truncate">
                    {Object.keys(execution.triggerData).length > 0
                      ? Object.keys(execution.triggerData).join(', ')
                      : 'No data'}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(execution)}
                        title="View details"
                      >
                        <Eye className=" ui-icon w-5 h-5" />
                      </Button>
                    )}

                    {execution.status === 'FAILED' && onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(execution.id)}
                        title="Retry execution"
                      >
                        <RotateCw className=" ui-icon w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
