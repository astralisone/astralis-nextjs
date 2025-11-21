'use client';

import { format } from 'date-fns';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Document } from '@/types/documents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  /** Document to display */
  document: Document | null;
  /** Whether viewer is open */
  isOpen: boolean;
  /** Callback when viewer is closed */
  onClose: () => void;
}

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Document Viewer Component
 * Modal/sheet to view document with OCR overlay and extracted data
 */
export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showOcrOverlay, setShowOcrOverlay] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  /**
   * Fetch signed URL when document changes
   */
  useEffect(() => {
    if (document?.id && isOpen) {
      setIsLoadingUrl(true);
      fetch(`/api/documents/${document.id}/url`)
        .then((res) => res.json())
        .then((data) => {
          setSignedUrl(data.url);
          setIsLoadingUrl(false);
        })
        .catch((error) => {
          console.error('Failed to fetch signed URL:', error);
          setIsLoadingUrl(false);
        });
    } else {
      setSignedUrl(null);
    }
  }, [document?.id, isOpen]);

  if (!document) return null;

  const isImage = document.mimeType.startsWith('image/');
  const isPdf = document.mimeType === 'application/pdf';

  /**
   * Handle download
   */
  const handleDownload = async () => {
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(`/api/documents/${document.id}/url`);
        const data = await response.json();

        const link = window.document.createElement('a');
        link.href = data.url;
        link.download = document.originalName;
        link.click();
      } catch (error) {
        console.error('Failed to download document:', error);
      }
    }
  };

  /**
   * Zoom controls
   */
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-8">
              <SheetTitle className="truncate">{document.originalName}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <span>{formatFileSize(document.fileSize)}</span>
                <span>•</span>
                <span>{format(new Date(document.createdAt), 'PPP')}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Document Viewer */}
        <div className="mt-6 space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Rotation */}
              {isImage && (
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}

              {/* Reset View */}
              <Button variant="ghost" size="sm" onClick={handleResetView}>
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* OCR Overlay Toggle */}
              {document.ocrText && isImage && (
                <Button
                  variant={showOcrOverlay ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowOcrOverlay((prev) => !prev)}
                >
                  {showOcrOverlay ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide OCR
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show OCR
                    </>
                  )}
                </Button>
              )}

              {/* Download */}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {/* Document Display */}
          <div className="relative bg-slate-100 rounded-lg overflow-hidden min-h-[500px] flex items-center justify-center p-4">
            {signedUrl ? (
              <>
                {isImage && (
                  <img
                    src={signedUrl}
                    alt={document.originalName}
                    className="max-w-full h-auto transition-transform"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    }}
                  />
                )}

                {isPdf && (
                  <iframe
                    src={signedUrl}
                    className="w-full h-[600px] border-0"
                    title={document.originalName}
                  />
                )}

                {!isImage && !isPdf && (
                  <div className="text-center text-slate-500">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <p>Preview not available for this file type</p>
                    <Button
                      variant="primary"
                      size="lg"
                      className="mt-4"
                      onClick={handleDownload}
                    >
                      Download to View
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-500">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p>Document not available</p>
              </div>
            )}
          </div>

          {/* OCR Text Overlay */}
          {showOcrOverlay && document.ocrText && (
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="text-sm font-semibold text-astralis-navy mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Extracted Text (OCR)
                {document.ocrConfidence && (
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round(document.ocrConfidence * 100)}% confidence
                  </Badge>
                )}
              </h4>
              <div className="text-sm text-slate-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {document.ocrText}
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {document.extractedData && Object.keys(document.extractedData).length > 0 && (
            <div className="p-4 bg-white border border-slate-200 rounded-lg">
              <h4 className="text-sm font-semibold text-astralis-navy mb-3">
                Extracted Structured Data
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(document.extractedData).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-astralis-navy font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-semibold text-astralis-navy mb-3">
              Document Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">File Name</p>
                <p className="text-astralis-navy font-medium break-all">
                  {document.fileName}
                </p>
              </div>
              <div>
                <p className="text-slate-500">File Size</p>
                <p className="text-astralis-navy font-medium">
                  {formatFileSize(document.fileSize)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">MIME Type</p>
                <p className="text-astralis-navy font-medium">{document.mimeType}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <Badge
                  variant={
                    document.status === 'COMPLETED'
                      ? 'success'
                      : document.status === 'FAILED'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {document.status}
                </Badge>
              </div>
              <div>
                <p className="text-slate-500">Uploaded</p>
                <p className="text-astralis-navy font-medium">
                  {format(new Date(document.createdAt), 'PPpp')}
                </p>
              </div>
              {document.processedAt && (
                <div>
                  <p className="text-slate-500">Processed</p>
                  <p className="text-astralis-navy font-medium">
                    {format(new Date(document.processedAt), 'PPpp')}
                  </p>
                </div>
              )}
            </div>

            {/* Processing Error */}
            {document.processingError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-error mb-1">Processing Error</p>
                <p className="text-sm text-red-700">{document.processingError}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
