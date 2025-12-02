'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin } from 'lucide-react';

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

interface TimezoneSelectorProps {
  currentTimezone: string;
  onSuccess?: (timezone: string) => void;
  onError?: (error: string) => void;
}

export function TimezoneSelector({
  currentTimezone,
  onSuccess,
  onError,
}: TimezoneSelectorProps) {
  const [timezone, setTimezone] = useState(currentTimezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to detect timezone';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const saveTimezone = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save timezone');
      }

      setSaved(true);
      onSuccess?.(timezone);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save timezone';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      {saved && (
        <Alert variant="success" showIcon>
          <AlertDescription>Timezone preference saved successfully</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" showIcon>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Timezone Selector */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-sm font-medium">
          Timezone
        </Label>
        <p className="text-xs text-slate-500">
          Choose your timezone to view times in your local time
        </p>
        <div className="flex gap-2">
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex-1 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={detectTimezone}
            disabled={saving}
            className="gap-1.5"
          >
            <MapPin className="h-4 w-4" />
            Detect
          </Button>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
        <p className="text-xs text-slate-600 mb-1">Current time in selected timezone:</p>
        <p className="text-sm font-medium text-astralis-navy">
          {new Date().toLocaleString('en-US', {
            timeZone: timezone,
            dateStyle: 'medium',
            timeStyle: 'long',
          })}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveTimezone}
          disabled={saving || timezone === currentTimezone}
          className="gap-1.5"
          variant="primary"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
