'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

/**
 * Global providers wrapper for the application
 *
 * Configures:
 * - NextAuth SessionProvider for authentication state
 * - TanStack Query (React Query v5) for server state management
 * - Query client with optimized defaults for dashboard UX
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache Configuration
            staleTime: 30 * 1000, // 30 seconds - data considered fresh
            gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (formerly cacheTime)

            // Refetch Configuration
            refetchOnWindowFocus: false, // Don't refetch on tab switch
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch when component mounts

            // Retry Configuration
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.status && error.status >= 400 && error.status < 500) {
                return false;
              }
              // Retry up to 2 times for 5xx errors
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once on network errors
            retry: (failureCount, error: any) => {
              if (error?.status && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
            // Network timeout
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
