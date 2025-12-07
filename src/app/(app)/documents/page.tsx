'use client';

import { useState, useMemo } from 'react';
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments';
import { formatDate } from '@/lib/utils/date';

// Components
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentChat } from '@/components/documents/DocumentChat';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

// Icons
import {
  Search,
  Upload as UploadIcon,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Eye,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';

// Types
import { Document, DocumentStatus } from '@/types/documents';

// Constants
type SortColumn = 'name' | 'type' | 'size' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const STATUS_VARIANTS: Record<DocumentStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileTypeLabel = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return mimeType.replace('image/', '').toUpperCase();
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word')) return 'DOC';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLS';
  return mimeType.split('/').pop()?.toUpperCase() || 'FILE';
};

export default function DocumentsPage() {
  // State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatDocumentId, setChatDocumentId] = useState<string | undefined>();

  const itemsPerPage = 12;

  // Data fetching
  const { data: documentsData, isLoading, error } = useDocuments({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchQuery || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const { data: stats } = useDocumentStats();

  const documents = documentsData?.documents ?? [];
  const totalDocuments = documentsData?.total ?? 0;
  const hasMore = documentsData?.hasMore ?? false;
  const hasFilters = statusFilter !== 'ALL' || searchQuery;

  // Sorted documents
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case 'name': cmp = a.originalName.localeCompare(b.originalName); break;
        case 'type': cmp = a.mimeType.localeCompare(b.mimeType); break;
        case 'size': cmp = a.fileSize - b.fileSize; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [documents, sortColumn, sortDirection]);

  // Handlers
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.cdnUrl) window.open(doc.cdnUrl, '_blank');
  };

  const handleChat = (documentId?: string) => {
    setChatDocumentId(documentId);
    setShowChat(true);
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ChevronUp className="h-4 w-4 text-slate-300" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-4 w-4 text-astralis-blue" />
      : <ChevronDown className="h-4 w-4 text-astralis-blue" />;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Manage and view uploaded documents with OCR processing"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleChat()}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Documents
            </Button>
            <Button variant="primary" onClick={() => setShowUploader(true)}>
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-astralis-navy' },
            { label: 'Pending', value: stats.pending, color: 'text-slate-600' },
            { label: 'Processing', value: stats.processing, color: 'text-warning' },
            { label: 'Completed', value: stats.completed, color: 'text-success' },
            { label: 'Failed', value: stats.failed, color: 'text-error' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* View Toggle & Filters */}
     
    </PageContainer>
  );
}
