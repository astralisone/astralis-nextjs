'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Root Error Boundary - Catches and displays errors in the application
 *
 * This component follows Astralis brand guidelines:
 * - Error state with clear messaging
 * - Astralis Blue accent colors
 * - Recovery actions (Reset/Home)
 * - Accessible error reporting
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center justify-center rounded-full bg-error/10 p-6">
            <AlertCircle className="h-12 w-12 text-error" strokeWidth={2} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-astralis-navy dark:text-white">
          Something went wrong
        </h1>

        <p className="mb-8 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 text-left">
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
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
            Try again
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="secondary"
            size="lg"
            className="min-w-[160px]"
          >
            Go home
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-slate-600 dark:text-slate-400">
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
