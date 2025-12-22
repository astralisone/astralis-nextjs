'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * App Layout Error Boundary
 *
 * Catches and displays runtime errors in the authenticated app routes.
 * This component follows Astralis brand guidelines and provides:
 * - User-friendly error messaging in production
 * - Detailed error information in development
 * - Recovery actions (reset/home)
 * - Accessible error reporting
 *
 * This error boundary catches errors that occur within the (app) route group,
 * providing a fallback UI when the main dashboard or any protected route fails.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('App route error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="mx-auto max-w-2xl w-full">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center rounded-full bg-error/10 p-6">
            <AlertCircle className="h-12 w-12 text-error" strokeWidth={2} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-astralis-navy text-center">
          Something Went Wrong
        </h1>

        <p className="mb-8 text-base leading-relaxed text-slate-700 text-center">
          We encountered an unexpected error. This has been logged and we'll investigate.
          Please try refreshing the page or return to the home page.
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
            <AlertTitle>What happened?</AlertTitle>
            <AlertDescription>
              <p className="mt-2 text-sm">
                An unexpected error occurred while processing your request. Our team has been
                notified and will investigate the issue.
              </p>
              {error.digest && (
                <p className="mt-2 text-sm">
                  <strong>Error Reference:</strong> {error.digest}
                </p>
              )}
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
            onClick={() => (window.location.href = '/')}
            variant="secondary"
            size="lg"
            className="min-w-[160px]"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-slate-600 text-center">
          Need help?{' '}
          <a
            href="/contact"
            className="font-medium text-astralis-blue hover:underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
