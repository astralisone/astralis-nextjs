'use client';

import { useState } from 'react';
import { Search, Filter, Upload as UploadIcon, MessageSquare } from 'lucide-react';
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
  const [showChat, setShowChat] = useState(true);
  const [chatDocumentId, setChatDocumentId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | undefined>();
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

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
          <div className="flex gap-2">
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

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading documents...</p>
        </div>
      )}

      {error && (
        <Card variant="bordered" className="p-6">
          <p className="text-error text-center">
            Failed to load documents. Please try again.
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
