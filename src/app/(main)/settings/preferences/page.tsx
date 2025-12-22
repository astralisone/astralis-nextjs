'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { TimezoneSelector } from '@/components/settings/TimezoneSelector';
import { Loader2, Globe } from 'lucide-react';

export default function PreferencesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimezone, setCurrentTimezone] = useState('UTC');

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/preferences');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch preferences');
        }

        const data = await response.json();
        setCurrentTimezone(data.timezone || 'UTC');
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-astralis-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-astralis-navy">Preferences</h1>
        <p className="text-slate-600 mt-1">Manage your application preferences</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" showIcon>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Timezone Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Timezone Settings</CardTitle>
              <CardDescription>
                Configure your timezone to view times in your local time zone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TimezoneSelector
            currentTimezone={currentTimezone}
            onSuccess={(newTimezone) => {
              setCurrentTimezone(newTimezone);
              setError(null);
            }}
            onError={(errorMessage) => {
              setError(errorMessage);
            }}
          />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <Alert variant="info" showIcon>
            <AlertTitle>How Timezone Settings Work</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                <li>All times in the application will be displayed in your selected timezone</li>
                <li>Scheduling and calendar events will respect your timezone preference</li>
                <li>
                  Use the "Detect" button to automatically set your timezone based on your
                  browser
                </li>
                <li>Changes take effect immediately after saving</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
