'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Mail,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Save,
  Calendar,
  Bell,
  ShoppingBag,
  FileText,
  Gift
} from 'lucide-react';
import { useToast } from '@/hooks';

interface SubscriberData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  preferences: {
    blogUpdates: boolean;
    productUpdates: boolean;
    marketplaceUpdates: boolean;
    eventNotifications: boolean;
    specialOffers: boolean;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    preferredTime?: string;
    timezone?: string;
  } | null;
}

export function NewsletterPreferenceCenter() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriber, setSubscriber] = useState<SubscriberData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const { toast } = useToast();

  const [preferences, setPreferences] = useState({
    blogUpdates: true,
    productUpdates: true,
    marketplaceUpdates: false,
    eventNotifications: false,
    specialOffers: false,
    frequency: 'WEEKLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY',
    preferredTime: '',
    timezone: ''
  });

  useEffect(() => {
    if (token) {
      fetchSubscriberData();
    } else {
      setError('Invalid or missing token');
      setLoading(false);
    }
  }, [token]);

  const fetchSubscriberData = async () => {
    try {
      const response = await fetch(`/api/newsletter/preferences/${token}`);

      if (response.ok) {
        const data = await response.json();
        setSubscriber(data.subscriber);

        if (data.subscriber.preferences) {
          setPreferences({
            ...preferences,
            ...data.subscriber.preferences
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load preferences');
      }
    } catch (err) {
      console.error('Error fetching subscriber data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/newsletter/preferences/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Your preferences have been updated successfully!');
        toast({
          title: 'Success',
          description: 'Your newsletter preferences have been updated.',
        });
      } else {
        throw new Error(result.message || 'Failed to update preferences');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Unsubscribed',
          description: result.message,
        });
        setShowUnsubscribe(false);
        window.location.href = '/newsletter/unsubscribed';
      } else {
        throw new Error(result.message || 'Failed to unsubscribe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20
                    flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !subscriber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20
                    flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-violet-900/20 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500/20
                        to-violet-500/20 rounded-full border border-purple-500/20 mb-4">
            <Settings className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Newsletter Preferences
          </h1>
          <p className="text-gray-400">
            Customize your email preferences and manage your subscription
          </p>
        </div>

        {/* Subscriber Info */}
        {subscriber && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-purple-400" />
                <div>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your current subscription details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email Address:</span>
                <span className="text-white font-medium">{subscriber.email}</span>
              </div>
              {(subscriber.firstName || subscriber.lastName) && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-medium">
                    {[subscriber.firstName, subscriber.lastName].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge
                  variant="outline"
                  className={subscriber.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }
                >
                  {subscriber.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Preferences Form */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-white">Email Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose what content you'd like to receive from us
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Content Types</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    id="blogUpdates"
                    checked={preferences.blogUpdates}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, blogUpdates: checked as boolean })
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <Label htmlFor="blogUpdates" className="text-white font-medium">
                        Blog Updates
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Latest articles, insights, and trends in AI and digital transformation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    id="productUpdates"
                    checked={preferences.productUpdates}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, productUpdates: checked as boolean })
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Settings className="h-4 w-4 text-green-400" />
                      <Label htmlFor="productUpdates" className="text-white font-medium">
                        Product Updates
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400">
                      New features, service announcements, and platform updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    id="marketplaceUpdates"
                    checked={preferences.marketplaceUpdates}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, marketplaceUpdates: checked as boolean })
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <ShoppingBag className="h-4 w-4 text-purple-400" />
                      <Label htmlFor="marketplaceUpdates" className="text-white font-medium">
                        Marketplace Updates
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400">
                      New services, marketplace offerings, and partnership announcements
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    id="eventNotifications"
                    checked={preferences.eventNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, eventNotifications: checked as boolean })
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Bell className="h-4 w-4 text-yellow-400" />
                      <Label htmlFor="eventNotifications" className="text-white font-medium">
                        Event Notifications
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Webinars, workshops, conferences, and exclusive events
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Checkbox
                    id="specialOffers"
                    checked={preferences.specialOffers}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, specialOffers: checked as boolean })
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Gift className="h-4 w-4 text-red-400" />
                      <Label htmlFor="specialOffers" className="text-white font-medium">
                        Special Offers
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Exclusive deals, promotional content, and early access opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Frequency Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Email Frequency</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-white">How often would you like to receive emails?</Label>
                <Select
                  value={preferences.frequency}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      frequency: value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
                    })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/10">
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Delivery Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Delivery Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredTime" className="text-white">
                    Preferred Time (Optional)
                  </Label>
                  <Input
                    id="preferredTime"
                    type="time"
                    value={preferences.preferredTime}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferredTime: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">
                    Timezone (Optional)
                  </Label>
                  <Input
                    id="timezone"
                    type="text"
                    placeholder="e.g., America/New_York"
                    value={preferences.timezone}
                    onChange={(e) =>
                      setPreferences({ ...preferences, timezone: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600
                         hover:to-violet-600 disabled:from-gray-600 disabled:to-gray-600"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowUnsubscribe(true)}
                className="border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Unsubscribe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unsubscribe Confirmation Dialog */}
        {showUnsubscribe && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-gray-900/95 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  Confirm Unsubscribe
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Are you sure you want to unsubscribe from all newsletter emails?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 text-sm">
                    You will no longer receive any newsletter emails from Astralis Agency.
                    You can always resubscribe later if you change your mind.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUnsubscribe(false)}
                    className="flex-1 border-white/20 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUnsubscribe}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    Yes, Unsubscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@astralisagency.com" className="text-purple-400 hover:text-purple-300">
              support@astralisagency.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
