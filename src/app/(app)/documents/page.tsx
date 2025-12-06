'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils/date';
import {
  Search,
  Filter,
  Upload as UploadIcon,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Eye,
  Download,
  Trash2,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentChat } from '@/components/documents/DocumentChat';
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
import { Document, DocumentStatus } from '@/types/documents';

type SortColumn = 'name' | 'type' | 'size' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'table';

const statusVariants: Record<DocumentStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'default',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
};

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type label from mime type
 */
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return mimeType.replace('image/', '').toUpperCase();
  }
  if (mimeType === 'application/pdf') {
    return 'PDF';
  }
  if (mimeType.includes('word')) {
    return 'DOC';
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'XLS';
  }
  return mimeType.split('/').pop()?.toUpperCase() || 'FILE';
}

/**
 * Document Queue Page
 * Displays all documents with filtering, search, and upload functionality
 */
export default function DocumentsPage() {
  // Session
  const { data: session } = useSession();

  // State
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatDocumentId, setChatDocumentId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | undefined>();
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const itemsPerPage = 12;

  // Fetch data
  const {
    data: documentsData,
    isLoading,
    error,
  } = useDocuments({
    status: statusFilter,
    mimeType: mimeTypeFilter,
    search: searchQuery || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });

  const { data: stats } = useDocumentStats();

  const documents = documentsData?.documents || [];
  const totalDocuments = documentsData?.total || 0;
  const hasMore = documentsData?.hasMore || false;

  /**
   * Sorted documents for table view
   */
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
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [documents, sortColumn, sortDirection]);

  /**
   * Handle column sort
   */
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Render sort icon for table header
   */
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

  /**
   * Handle download document
   */
  const handleDownloadDocument = (document: Document) => {
    if (document.cdnUrl) {
      window.open(document.cdnUrl, '_blank');
    }
  };

  /**
   * Handle delete document (placeholder - no write operations)
   */
  const handleDeleteDocument = (document: Document) => {
    // NOTE: Delete functionality requires explicit user approval for database writes
    console.log('Delete requested for document:', document.id);
  };

  /**
   * Handle upload complete
   */
  const handleUploadComplete = () => {
    setShowUploader(false);
    // Documents list will auto-refresh via query invalidation
  };

  /**
   * Handle view document
   */
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  /**
   * Handle close viewer
   */
  const handleCloseViewer = () => {
    setSelectedDocument(null);
  };

  /**
   * Handle open chat for specific document
   */
  const handleChatWithDocument = (documentId: string) => {
    setChatDocumentId(documentId);
    setShowChat(true);
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setStatusFilter(undefined);
    setMimeTypeFilter(undefined);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasFilters = statusFilter || mimeTypeFilter || searchQuery;

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
              className="gap-2"
              onClick={() => {
                setChatDocumentId(undefined);
                setShowChat(true);
              }}
            >
              <MessageSquare className="h-5 w-5" />
              Chat with Documents
            </Button>
            <Button variant="primary" className="gap-2" onClick={() => setShowUploader(true)}>
              <UploadIcon className="h-5 w-5" />
              Upload Documents
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Total Documents</p>
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

      {/* View Toggle Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            viewMode === 'table'
              ? 'border-astralis-blue text-astralis-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutList className="h-5 w-5" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            viewMode === 'grid'
              ? 'border-astralis-blue text-astralis-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          Grid View
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Search - Full Width */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasFilters && (
            <Badge variant="primary" className="ml-1">
              {[statusFilter, mimeTypeFilter, searchQuery].filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Documents List */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading documents...</p>
        </div>
      )}

      {error && (
        <Card variant="bordered" className="p-6">
          <p className="text-error text-center font-semibold mb-2">
            Failed to load documents
          </p>
          <p className="text-sm text-slate-600 text-center">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </Card>
      )}

      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={UploadIcon}
          title="No documents found"
          description={
            hasFilters
              ? 'Try adjusting your filters or search query'
              : 'Upload your first document to get started'
          }
          primaryAction={
            !hasFilters
              ? {
                  label: 'Upload Documents',
                  onClick: () => setShowUploader(true),
                }
              : undefined
          }
        />
      )}

      {!isLoading && !error && documents.length > 0 && (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <Card variant="default" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {renderSortIcon('name')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {renderSortIcon('type')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('size')}
                      >
                        <div className="flex items-center gap-1">
                          Size
                          {renderSortIcon('size')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {renderSortIcon('status')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Uploaded
                          {renderSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {sortedDocuments.map((document, index) => (
                      <tr
                        key={document.id}
                        className={`hover:bg-slate-100 transition-colors ${
                          index % 2 === 1 ? 'bg-slate-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-astralis-navy truncate max-w-[250px]" title={document.originalName}>
                            {document.originalName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="default">
                            {getFileTypeLabel(document.mimeType)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatFileSize(document.fileSize)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={statusVariants[document.status]}>
                            {document.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDate(document.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDocument(document)}
                              className="p-2 text-slate-600 hover:text-astralis-blue hover:bg-slate-100 rounded-md transition-colors"
                              title="View document"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(document)}
                              className="p-2 text-slate-600 hover:text-astralis-blue hover:bg-slate-100 rounded-md transition-colors"
                              title="Download document"
                              disabled={!document.cdnUrl}
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(document)}
                              className="p-2 text-slate-600 hover:text-error hover:bg-red-50 rounded-md transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="h-5 w-5" />
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
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
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
                {Math.min(currentPage * itemsPerPage, totalDocuments)} of {totalDocuments}{' '}
                documents
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
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

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-astralis-navy mb-2 block">
                Status
              </label>
              <div className="space-y-2">
                {(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as DocumentStatus[]).map(
                  (status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === status}
                        onChange={() => setStatusFilter(status)}
                        className="text-astralis-blue focus:ring-astralis-blue"
                      />
                      <span className="text-sm text-slate-700">{status}</span>
                    </label>
                  )
                )}
                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={!statusFilter}
                    onChange={() => setStatusFilter(undefined)}
                    className="text-astralis-blue focus:ring-astralis-blue"
                  />
                  <span className="text-sm text-slate-700">All</span>
                </label>
              </div>
            </div>

            {/* File Type Filter */}
            <div>
              <label className="text-sm font-medium text-astralis-navy mb-2 block">
                File Type
              </label>
              <div className="space-y-2">
                {[
                  { label: 'Images', value: 'image/' },
                  { label: 'PDFs', value: 'application/pdf' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="mimeType"
                      checked={mimeTypeFilter === type.value}
                      onChange={() => setMimeTypeFilter(type.value)}
                      className="text-astralis-blue focus:ring-astralis-blue"
                    />
                    <span className="text-sm text-slate-700">{type.label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="mimeType"
                    checked={!mimeTypeFilter}
                    onChange={() => setMimeTypeFilter(undefined)}
                    className="text-astralis-blue focus:ring-astralis-blue"
                  />
                  <span className="text-sm text-slate-700">All</span>
                </label>
              </div>
            </div>

            {/* Apply Filters */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Document Viewer */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={handleCloseViewer}
      />

      {/* Document Chat */}
      {session?.user && (
        <Sheet open={showChat} onOpenChange={setShowChat}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
            <SheetHeader>
              <SheetTitle>
                {chatDocumentId ? 'Chat with Document' : 'Chat with Documents'}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden mt-6">
              <DocumentChat
                documentId={chatDocumentId}
                orgId={session.user.orgId}
                userId={session.user.id}
                className="h-full"
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </PageContainer>
  );
}
