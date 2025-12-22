'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Documents Route Error Boundary
 *
 * Catches and displays runtime errors in the documents page.
 * This component follows Astralis brand guidelines and provides:
 * - User-friendly error messaging in production
 * - Detailed error information in development
 * - Recovery actions (reset/navigate)
 * - Accessible error reporting
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

interface DocumentsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DocumentsError({ error, reset }: DocumentsErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Documents page error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl w-full">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center rounded-full bg-error/10 p-6">
            <FileX className="h-12 w-12 text-error" strokeWidth={2} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-astralis-navy text-center">
          Failed to Load Documents
        </h1>

        <p className="mb-8 text-base leading-relaxed text-slate-700 text-center">
          We encountered an error while loading your documents. This could be due to a
          connection issue or a temporary problem with the document service.
        </p>

        {/* Development Error Details */}
        {isDevelopment && (
          <Alert variant="error" showIcon className="mb-8">
            <AlertTitle>Development Error Details</AlertTitle>
            <AlertDescription>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-error mb-1">Error Message:</p>
                  <p className="text-sm font-mono text-slate-700 break-words bg-white p-2 rounded border border-red-200">
                    {error.message}
                  </p>
                </div>

                {error.digest && (
                  <div>
                    <p className="text-xs font-semibold text-error mb-1">Error ID:</p>
                    <p className="text-sm font-mono text-slate-600 bg-white p-2 rounded border border-red-200">
                      {error.digest}
                    </p>
                  </div>
                )}

                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-error cursor-pointer hover:text-error/80">
                      Stack Trace (click to expand)
                    </summary>
                    <pre className="mt-2 text-xs font-mono text-slate-600 bg-white p-3 rounded border border-red-200 overflow-x-auto max-h-64 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Production Error Hint */}
        {!isDevelopment && (
          <Alert variant="info" showIcon className="mb-8">
            <AlertTitle>What can I do?</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Try refreshing the page using the button below</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and reload</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="primary"
            size="lg"
            className="min-w-[160px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="secondary"
            size="lg"
            className="min-w-[160px]"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-slate-600 text-center">
          Still having issues?{' '}
          <a
            href="/contact"
            className="font-medium text-astralis-blue hover:underline"
          >
            Contact support
          </a>
          {error.digest && (
            <span className="block mt-1 text-xs text-slate-500">
              Reference ID: {error.digest}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
