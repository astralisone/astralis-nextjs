'use client';

import { format } from 'date-fns';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { Document } from '@/types/documents';
import { useDeleteDocument, useRetryDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  /** Document data */
  document: Document;
  /** Callback when view is clicked */
  onView?: (document: Document) => void;
  /** Callback when chat is clicked */
  onChat?: (documentId: string) => void;
  /** Show actions (view, download, delete) */
  showActions?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Status badge configuration
 */
const statusConfig = {
  PENDING: {
    variant: 'default' as const,
    label: 'Pending',
    icon: Loader2,
    iconClassName: 'animate-spin',
  },
  PROCESSING: {
    variant: 'warning' as const,
    label: 'Processing',
    icon: Loader2,
    iconClassName: 'animate-spin',
  },
  COMPLETED: {
    variant: 'success' as const,
    label: 'Completed',
    icon: CheckCircle,
    iconClassName: '',
  },
  FAILED: {
    variant: 'error' as const,
    label: 'Failed',
    icon: AlertCircle,
    iconClassName: '',
  },
};

/**
 * Get file type icon color
 */
const getFileTypeColor = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'text-purple-500';
  if (mimeType === 'application/pdf') return 'text-red-500';
  return 'text-slate-500';
};

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Document Card Component
 * Displays document thumbnail, metadata, OCR status, and actions
 */
export function DocumentCard({
  document,
  onView,
  onChat,
  showActions = true,
  className,
}: DocumentCardProps) {
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutate: retryDocument, isPending: isRetrying } = useRetryDocument();

  const statusInfo = statusConfig[document.status];
  const StatusIcon = statusInfo.icon;

  /**
   * Handle download
   */
  const handleDownload = () => {
    if (document.cdnUrl) {
      window.open(document.cdnUrl, '_blank');
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete "${document.originalName}"? This action cannot be undone.`
      )
    ) {
      deleteDocument(document.id);
    }
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    retryDocument(document.id);
  };

  return (
    <Card className={cn('overflow-hidden hover', className)} hover>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {document.thumbnailUrl ? (
              <img
                src={document.thumbnailUrl}
                alt={document.originalName}
                className="h-20 w-20 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div
                className={cn(
                  'h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center',
                  getFileTypeColor(document.mimeType)
                )}
              >
                <FileText className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold text-astralis-navy truncate"
                  title={document.originalName}
                >
                  {document.originalName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {formatFileSize(document.fileSize)} •{' '}
                  {format(new Date(document.createdAt), 'MMM d, yyyy')}
                </p>
              </div>

              {/* Status Badge */}
              <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                <StatusIcon className={cn('h-3 w-3', statusInfo.iconClassName)} />
                {statusInfo.label}
              </Badge>
            </div>

            {/* OCR Confidence */}
            {document.status === 'COMPLETED' && document.ocrConfidence !== null && (
              <div className="mt-2">
                <p className="text-xs text-slate-500">
                  OCR Confidence: {Math.round(document.ocrConfidence * 100)}%
                </p>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={cn(
                      'h-full transition-all',
                      document.ocrConfidence >= 0.8
                        ? 'bg-success'
                        : document.ocrConfidence >= 0.6
                        ? 'bg-warning'
                        : 'bg-error'
                    )}
                    style={{ width: `${document.ocrConfidence * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Messages */}
            {document.status === 'FAILED' && document.processingError && (
              <div className="mt-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-error">Processing Error:</p>
                  <p className="text-xs text-error">{document.processingError}</p>
                </div>
              </div>
            )}

            {/* Embedding Error */}
            {document.metadata &&
             typeof document.metadata === 'object' &&
             'embeddingError' in document.metadata && (
              <div className="mt-2 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-warning">Embedding Error:</p>
                  <p className="text-xs text-warning">
                    {String((document.metadata as any).embeddingError)}
                  </p>
                </div>
              </div>
            )}

            {/* Extracted Data Preview */}
            {document.extractedData && Object.keys(document.extractedData).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-600">Extracted Data:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(document.extractedData)
                    .slice(0, 3)
                    .map((key) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}
                      </Badge>
                    ))}
                  {Object.keys(document.extractedData).length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{Object.keys(document.extractedData).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2 w-full">
            {/* View Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(document)}
              className="flex-1"
              disabled={!document.cdnUrl}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>

            {/* Chat Button - only show for completed documents */}
            {document.status === 'COMPLETED' && onChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChat(document.id)}
                title="Chat with this document"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            )}

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!document.cdnUrl}
            >
              <Download className="h-5 w-5" />
            </Button>

            {/* Retry/Start Button (for pending, failed, or low-confidence documents) */}
            {(document.status === 'PENDING' ||
              document.status === 'FAILED' ||
              (document.status === 'COMPLETED' && (document.ocrConfidence === null || document.ocrConfidence === 0))) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                title={
                  document.status === 'PENDING'
                    ? 'Start processing'
                    : document.status === 'FAILED'
                    ? 'Retry processing'
                    : 'Re-process document'
                }
              >
                <RefreshCw className={cn('h-5 w-5', isRetrying && 'animate-spin')} />
              </Button>
            )}

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
