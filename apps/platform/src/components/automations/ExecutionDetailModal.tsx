'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, RotateCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { WorkflowExecution } from '@/types/automation';

interface ExecutionDetailModalProps {
  execution: WorkflowExecution | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: (executionId: string) => void;
}

const statusColors = {
  QUEUED: 'default',
  RUNNING: 'primary',
  SUCCESS: 'success',
  FAILED: 'error',
  TIMEOUT: 'warning',
  CANCELLED: 'default',
} as const;

const statusIcons = {
  QUEUED: Clock,
  RUNNING: Clock,
  SUCCESS: CheckCircle2,
  FAILED: XCircle,
  TIMEOUT: Clock,
  CANCELLED: XCircle,
};

export function ExecutionDetailModal({
  execution,
  isOpen,
  onClose,
  onRetry,
}: ExecutionDetailModalProps) {
  if (!execution) return null;

  const StatusIcon = statusIcons[execution.status];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                execution.status === 'SUCCESS'
                  ? 'bg-success/10 text-success'
                  : execution.status === 'FAILED'
                  ? 'bg-error/10 text-error'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Execution Details</DialogTitle>
              <DialogDescription>Execution ID: {execution.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Status:</span>
                <Badge variant={statusColors[execution.status]}>
                  {execution.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>
                  Started:{' '}
                  {new Date(execution.startedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
                {execution.completedAt && (
                  <span>
                    Completed:{' '}
                    {new Date(execution.completedAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </span>
                )}
              </div>
              {execution.executionTime && (
                <div className="text-sm text-slate-600">
                  Duration:{' '}
                  {execution.executionTime < 1000
                    ? `${execution.executionTime}ms`
                    : `${(execution.executionTime / 1000).toFixed(2)}s`}
                </div>
              )}
            </div>

            {execution.status === 'FAILED' && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(execution.id)}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>

          {/* Error Alert */}
          {execution.status === 'FAILED' && execution.errorMessage && (
            <Alert variant="error" showIcon>
              <AlertDescription className="font-medium">
                {execution.errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs for Data */}
          <Tabs defaultValue="input" className="w-full">
            <TabsList>
              <TabsTrigger value="input">Input Data</TabsTrigger>
              <TabsTrigger value="output">Output Data</TabsTrigger>
              {execution.errorStack && <TabsTrigger value="error">Error Stack</TabsTrigger>}
              {execution.metadata && <TabsTrigger value="metadata">Metadata</TabsTrigger>}
            </TabsList>

            <TabsContent value="input" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Trigger Data</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatJSON(execution.triggerData))}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                {formatJSON(execution.triggerData)}
              </pre>
            </TabsContent>

            <TabsContent value="output" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Output Data</h3>
                {execution.outputData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatJSON(execution.outputData))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              {execution.outputData ? (
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                  {formatJSON(execution.outputData)}
                </pre>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No output data available
                </div>
              )}
            </TabsContent>

            {execution.errorStack && (
              <TabsContent value="error" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Error Stack Trace</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(execution.errorStack || '')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-slate-900 text-red-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {execution.errorStack}
                </pre>
              </TabsContent>
            )}

            {execution.metadata && (
              <TabsContent value="metadata" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Execution Metadata</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatJSON(execution.metadata))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                  {formatJSON(execution.metadata)}
                </pre>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
