import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Document,
  DocumentFilters,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentStats,
} from '@/types/documents';

/**
 * Query key factory for documents
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (orgId: string, filters?: DocumentFilters) =>
    [...documentKeys.lists(), orgId, { filters }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (documentId: string) => [...documentKeys.details(), documentId] as const,
  stats: (orgId: string) => [...documentKeys.all, orgId, 'stats'] as const,
};

/**
 * Fetch documents with optional filtering and pagination
 */
export function useDocuments(filters?: DocumentFilters) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const queryParams = new URLSearchParams({
    orgId: orgId || '',
    ...(filters?.status && { status: filters.status }),
    ...(filters?.mimeType && { mimeType: filters.mimeType }),
    ...(filters?.uploadedBy && { uploadedBy: filters.uploadedBy }),
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate }),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.limit && { limit: filters.limit.toString() }),
    ...(filters?.offset && { offset: filters.offset.toString() }),
  });

  return useQuery({
    queryKey: orgId ? documentKeys.list(orgId, filters) : ['documents'],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/documents?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch documents (${response.status})`);
      }

      const data = (await response.json()) as DocumentListResponse;

      return {
        documents: data.documents,
        total: data.pagination.total,
        hasMore: data.pagination.hasMore,
      };
    },
    enabled: !!orgId,
    staleTime: 30000, // 30 seconds
    refetchInterval: (query) => {
      // Poll only if any documents are PENDING or PROCESSING
      const data = query.state.data;
      if (data?.documents) {
        const hasProcessingDocs = data.documents.some(
          (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING'
        );
        if (hasProcessingDocs) {
          return 5000; // Poll every 5 seconds
        }
      }
      return false; // Stop polling when all documents are complete
    },
  });
}

/**
 * Fetch a single document by ID
 */
export function useDocument(documentId: string | null) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: documentId ? documentKeys.detail(documentId) : ['document'],
    queryFn: async () => {
      if (!documentId || !orgId) throw new Error('Missing document ID or org ID');

      const response = await fetch(`/api/documents/${documentId}?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch document');

      const data = await response.json();
      return data.document as Document;
    },
    enabled: !!documentId && !!orgId,
    refetchInterval: (query) => {
      // Poll while document is processing
      const doc = query.state.data;
      if (doc && (doc.status === 'PENDING' || doc.status === 'PROCESSING')) {
        return 5000; // Poll every 5 seconds
      }
      return false; // Stop polling when complete
    },
  });
}

/**
 * Fetch document statistics for the organization
 */
export function useDocumentStats() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: orgId ? documentKeys.stats(orgId) : ['document-stats'],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/documents/stats?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch document stats');

      const data = await response.json();
      return data.stats as DocumentStats;
    },
    enabled: !!orgId,
    staleTime: 60000, // 1 minute
    refetchInterval: (query) => {
      // Poll if there are PENDING or PROCESSING documents
      const stats = query.state.data;
      if (stats && (stats.pending > 0 || stats.processing > 0)) {
        return 5000; // Poll every 5 seconds
      }
      return false; // Stop polling when no documents are processing
    },
  });
}

/**
 * Upload a document file
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      if (!orgId) throw new Error('No organization ID');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgId', orgId);

      return new Promise<DocumentUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', '/api/documents/upload');
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      // Invalidate document lists to show new upload
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentKeys.stats(orgId) });
      }
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}?orgId=${orgId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      return response.json();
    },
    onSuccess: (data, documentId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(documentId) });

      // Invalidate lists
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: documentKeys.stats(orgId) });
      }
    },
  });
}

/**
 * Retry processing a failed document
 */
export function useRetryDocument() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) throw new Error('Failed to retry document processing');

      return response.json();
    },
    onSuccess: (data, documentId) => {
      // Refetch document to show updated status
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      }
    },
  });
}
