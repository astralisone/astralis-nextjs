"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface IntegrationsSuccessHandlerProps {
  onRefreshData: () => Promise<void>;
}

export function IntegrationsSuccessHandler({
  onRefreshData,
}: IntegrationsSuccessHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHandlingSuccess, setIsHandlingSuccess] = useState(false);

  useEffect(() => {
    if (isHandlingSuccess) return; // Prevent double execution

    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    const setupGuideParam = searchParams.get('setupGuide');

    // Handle success
    if (success === 'true' && provider && !isHandlingSuccess) {
      setIsHandlingSuccess(true);

      // Use setTimeout to ensure component is fully mounted and toast system is ready
      const timer = setTimeout(async () => {
        try {
          // Safe toast call with fallback
          if (typeof toast === 'function') {
            toast({
              title: 'Success!',
              description: `Successfully connected ${provider.replace(/_/g, ' ')}`,
            });
          }

          // Refresh data safely
          await onRefreshData();

          // Clean URL without triggering re-renders
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('success');
          newUrl.searchParams.delete('provider');
          window.history.replaceState({}, '', newUrl.toString());

        } catch (error) {
          console.error('[Success Handler] Error:', error);
          // Don't crash the page
        } finally {
          setIsHandlingSuccess(false);
        }
      }, 500); // Wait for component to stabilize

      return () => clearTimeout(timer);
    }

    // Handle error
    if (error && provider) {
      const timer = setTimeout(() => {
        try {
          if (typeof toast === 'function') {
            toast({
              title: 'Connection Failed',
              description: error,
              variant: 'destructive',
            });
          }

          // Clean URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('error');
          newUrl.searchParams.delete('provider');
          window.history.replaceState({}, '', newUrl.toString());

        } catch (toastError) {
          console.error('[Error Handler] Toast error:', toastError);
        }
      }, 500);

      return () => clearTimeout(timer);
    }

    // Handle setup guide
    if (setupGuideParam) {
      try {
        // Note: setupGuide handling would need to be passed up to parent
        // For now, just clean the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('setupGuide');
        window.history.replaceState({}, '', newUrl.toString());

      } catch (setupError) {
        console.error('[Setup Guide] Error:', setupError);
      }
    }
  }, [searchParams, isHandlingSuccess, onRefreshData]);

  // This component doesn't render anything
  return null;
}