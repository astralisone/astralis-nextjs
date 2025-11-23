'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { UploadProgress } from '@/types/documents';

interface DocumentUploaderProps {
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Accepted file types (default: images and PDFs) */
  acceptedTypes?: string[];
  /** Maximum number of files to upload at once */
  maxFiles?: number;
  /** Callback when all uploads complete */
  onComplete?: () => void;
  /** Custom className */
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploader({
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 5,
  onComplete,
  className,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: uploadDocument } = useUploadDocument();

  /**
   * Validate a single file
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} not supported. Please upload images or PDFs.`;
      }

      // Check file size
      if (file.size > maxSize) {
        return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit.`;
      }

      return null;
    },
    [acceptedTypes, maxSize]
  );

  /**
   * Handle file upload
   */
  const handleUpload = useCallback(
    async (files: File[]) => {
      setError(null);

      // Validate number of files
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed at once.`);
        return;
      }

      // Validate each file
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // Initialize upload progress tracking
      const initialUploads: UploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }));

      setUploads(initialUploads);

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Update status to uploading
          setUploads((prev) =>
            prev.map((upload, idx) =>
              idx === i ? { ...upload, status: 'uploading' } : upload
            )
          );

          // Upload file with progress tracking
          const response = await uploadDocument({
            file,
            onProgress: (progress) => {
              setUploads((prev) =>
                prev.map((upload, idx) =>
                  idx === i ? { ...upload, progress } : upload
                )
              );
            },
          });

          // Update status to processing (OCR will happen in background)
          setUploads((prev) =>
            prev.map((upload, idx) =>
              idx === i
                ? {
                    ...upload,
                    status: 'processing',
                    progress: 100,
                    document: response.document,
                  }
                : upload
            )
          );

          // Mark as completed after a short delay
          setTimeout(() => {
            setUploads((prev) =>
              prev.map((upload, idx) =>
                idx === i ? { ...upload, status: 'completed' } : upload
              )
            );
          }, 1000);
        } catch (err) {
          // Handle upload error
          setUploads((prev) =>
            prev.map((upload, idx) =>
              idx === i
                ? {
                    ...upload,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : upload
            )
          );
        }
      }

      // Call onComplete callback
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    },
    [maxFiles, validateFile, uploadDocument, onComplete]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUpload(files);
      }
    },
    [handleUpload]
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleUpload(files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleUpload]
  );

  /**
   * Remove upload from list
   */
  const removeUpload = useCallback((index: number) => {
    setUploads((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  /**
   * Clear all uploads
   */
  const clearAll = useCallback(() => {
    setUploads([]);
    setError(null);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'relative transition-all duration-200',
          isDragging && 'border-astralis-blue border-2 bg-blue-50'
        )}
      >
        <CardContent className="p-8">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-colors',
                isDragging ? 'bg-astralis-blue' : 'bg-slate-100'
              )}
            >
              <Upload
                className={cn(
                  'h-10 w-10 transition-colors',
                  isDragging ? 'text-white' : 'text-slate-600'
                )}
              />
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-astralis-navy">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or click to browse (max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB
                each)
              </p>
            </div>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInputChange}
            />

            <label htmlFor="file-upload">
              <Button variant="primary" size="lg" asChild>
                <span>Select Files</span>
              </Button>
            </label>

            <p className="text-xs text-slate-400">
              Supported: JPG, PNG, WebP, PDF
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-astralis-navy">
                Uploading {uploads.length} {uploads.length === 1 ? 'file' : 'files'}
              </h3>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <div
                  key={`${upload.file.name}-${index}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-astralis-blue" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-astralis-navy truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Progress Bar */}
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-astralis-blue transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {upload.status === 'uploading'
                            ? `Uploading... ${upload.progress}%`
                            : 'Processing...'}
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {upload.status === 'error' && upload.error && (
                      <p className="text-xs text-error mt-1">{upload.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {upload.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 text-astralis-blue animate-spin" />
                    )}
                    {upload.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                    )}
                    {upload.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-error" />
                    )}
                  </div>

                  {/* Remove Button */}
                  {(upload.status === 'completed' || upload.status === 'error') && (
                    <button
                      onClick={() => removeUpload(index)}
                      className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
