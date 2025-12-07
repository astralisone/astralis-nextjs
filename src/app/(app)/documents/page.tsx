'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Icons
import {
  Search,
  Upload as UploadIcon,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Eye,
  Download,
  LayoutGrid,
  LayoutList,
  FileText,
} from 'lucide-react';

// Types
import { Document, DocumentStatus } from '@/types/documents';

// Constants
type SortColumn = 'name' | 'type' | 'size' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';

const STATUS_VARIANTS: Record<DocumentStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
};

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return mimeType.replace('image/', '').toUpperCase();
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word')) return 'DOC';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLS';
  return mimeType.split('/').pop()?.toUpperCase() || 'FILE';
}

/**
 * Documents Page
 * Displays uploaded documents with filtering, search, and management
 */
export default function DocumentsPage() {
  // Session
  const { data: session } = useSession();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sheet/Modal State
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatDocumentId, setChatDocumentId] = useState<string | undefined>();

  const itemsPerPage = 12;

  // Data fetching
  const {
    data: documentsData,
    isLoading,
    error,
  } = useDocuments({
    status: statusFilter,
    search: searchQuery || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const { data: stats } = useDocumentStats();

  // Derived data
  const documents = documentsData?.documents ?? [];
  const totalDocuments = documentsData?.total ?? 0;
  const hasMore = documentsData?.hasMore ?? false;

  // Sorted documents
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [documents, sortColumn, sortDirection]);

  // Handlers
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.cdnUrl && typeof window !== 'undefined') {
      window.open(doc.cdnUrl, '_blank');
    }
  };

  const handleChatWithDocument = (documentId: string) => {
    setChatDocumentId(documentId);
    setShowChat(true);
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
  };

  const clearFilters = () => {
    setStatusFilter(undefined);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Render helpers
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronUp className="h-4 w-4 text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-astralis-blue" />
    ) : (
      <ChevronDown className="h-4 w-4 text-astralis-blue" />
    );
  };

  const hasFilters = Boolean(statusFilter || searchQuery);

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Documents"
        description="Manage and view all uploaded documents with OCR processing"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setChatDocumentId(undefined);
                setShowChat(true);
              }}
            >
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-astralis-navy">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Processing</p>
              <p className="text-2xl font-bold text-warning">{stats.processing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Failed</p>
              <p className="text-2xl font-bold text-error">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* View Toggle */}
      <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === 'table'
              ? 'border-astralis-blue text-astralis-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutList className="h-5 w-5" />
          Table
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === 'grid'
              ? 'border-astralis-blue text-astralis-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          Grid
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value as DocumentStatus || undefined)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading documents...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <p className="text-error text-center font-semibold mb-2">Failed to load documents</p>
          <p className="text-sm text-slate-600 text-center">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={hasFilters ? 'Try adjusting your filters' : 'Upload your first document'}
          primaryAction={
            !hasFilters
              ? { label: 'Upload Documents', onClick: () => setShowUploader(true) }
              : undefined
          }
        />
      )}

      {/* Documents Content */}
      {!isLoading && !error && documents.length > 0 && (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <Card className="mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name {renderSortIcon('name')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center gap-1">
                          Type {renderSortIcon('type')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('size')}
                      >
                        <div className="flex items-center gap-1">
                          Size {renderSortIcon('size')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status {renderSortIcon('status')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Uploaded {renderSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-astralis-navy truncate block max-w-[250px]">
                            {doc.originalName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default">{getFileTypeLabel(doc.mimeType)}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={STATUS_VARIANTS[doc.status]}>{doc.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="p-2 text-slate-600 hover:text-astralis-blue hover:bg-slate-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 text-slate-600 hover:text-astralis-blue hover:bg-slate-100 rounded"
                              title="Download"
                              disabled={!doc.cdnUrl}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={handleViewDocument}
                  onChat={handleChatWithDocument}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalDocuments > itemsPerPage && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalDocuments)} of {totalDocuments}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Sheet */}
      <Sheet open={showUploader} onOpenChange={setShowUploader}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Upload Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <DocumentUploader onComplete={handleUploadComplete} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />


      {/* Document Chat */}
      <Sheet open={showChat} onOpenChange={setShowChat}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {chatDocumentId ? 'Chat with Document' : 'Chat with Documents'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden mt-6">
            <DocumentChat
              documentId={chatDocumentId} />
          </div>
        </SheetContent>
      </Sheet>


    </PageContainer>
  );
}
