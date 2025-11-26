'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building,
  Bell,
  Shield,
  CreditCard,
  Users,
  Settings as SettingsIcon,
  Loader2,
  UserPlus,
  Mail,
  Trash2,
  Globe,
} from 'lucide-react';
import { TimezoneSelector } from '@/components/settings/TimezoneSelector';

interface NotificationSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  bookingReminders: boolean;
  taskNotifications: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

interface OrgSettings {
  name: string;
  slug: string;
  website: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

type InviteRole = 'USER' | 'ADMIN' | 'OPERATOR' | 'PM' | 'CLIENT';

const ROLE_OPTIONS: { value: InviteRole; label: string; description: string }[] = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access to all settings and members' },
  { value: 'OPERATOR', label: 'Operator', description: 'Can manage operations and workflows' },
  { value: 'PM', label: 'Project Manager', description: 'Can manage projects and pipelines' },
  { value: 'USER', label: 'User', description: 'Standard access to platform features' },
  { value: 'CLIENT', label: 'Client', description: 'Limited client access' },
];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
  weeklyDigest: false,
  productUpdates: true,
  bookingReminders: true,
  taskNotifications: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

export default function SettingsPage() {
  const { data: session } = useSession();

  // Loading and feedback states
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings state
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    name: '',
    slug: '',
    website: '',
  });
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('USER');
  const [inviting, setInviting] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/me/settings');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch settings');
      }

      const data = await response.json();
      if (data.success && data.data) {
        if (data.data.preferences) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...data.data.preferences });
        }
        if (data.data.notifications) {
          setNotifications({ ...DEFAULT_NOTIFICATION_SETTINGS, ...data.data.notifications });
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch organization settings
  const fetchOrgSettings = useCallback(async () => {
    if (!session?.user?.orgId) return;

    try {
      const response = await fetch(`/api/orgs/${session.user.orgId}/settings`, {
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to fetch organization settings');
      }

      const data = await response.json();
      if (data) {
        setOrgSettings({
          name: data.name || '',
          slug: data.slug || '',
          website: data.website || '',
        });
      }
    } catch (err) {
      console.error('Error fetching organization settings:', err);
      // Don't show error for org settings fetch - user might not be in an org
    }
  }, [session?.user?.orgId, session?.user?.id]);

  // Fetch user timezone preference
  const fetchTimezonePreference = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch timezone preference');
      }

      const data = await response.json();
      setUserTimezone(data.timezone || 'UTC');
    } catch (err) {
      console.error('Error fetching timezone preference:', err);
      // Don't show error - use default UTC
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      fetchSettings();
      fetchOrgSettings();
      fetchTimezonePreference();
    } else {
      setLoading(false);
    }
  }, [session, fetchSettings, fetchOrgSettings, fetchTimezonePreference]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear team success message after 3 seconds
  useEffect(() => {
    if (teamSuccess) {
      const timer = setTimeout(() => setTeamSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [teamSuccess]);

  // Clear team error message after 5 seconds
  useEffect(() => {
    if (teamError) {
      const timer = setTimeout(() => setTeamError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [teamError]);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    if (!session?.user?.orgId) return;

    try {
      setLoadingTeam(true);
      setTeamError(null);

      const response = await fetch(`/api/orgs/${session.user.orgId}/members`, {
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to fetch team members');
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoadingTeam(false);
    }
  }, [session?.user?.orgId, session?.user?.id]);

  // Fetch team members when session is available
  useEffect(() => {
    if (session?.user?.orgId) {
      fetchTeamMembers();
    }
  }, [session?.user?.orgId, fetchTeamMembers]);

  // Invite a new team member
  const handleInviteMember = async () => {
    if (!session?.user?.orgId || !inviteEmail.trim()) return;

    try {
      setInviting(true);
      setTeamError(null);

      const response = await fetch(`/api/orgs/${session.user.orgId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to invite member');
      }

      setTeamSuccess(`Successfully invited ${inviteEmail} to the organization`);
      setInviteEmail('');
      setInviteRole('USER');
      setInviteModalOpen(false);
      fetchTeamMembers();
    } catch (err) {
      console.error('Error inviting member:', err);
      setTeamError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  // Remove a team member
  const handleRemoveMember = async (memberId: string) => {
    if (!session?.user?.orgId) return;

    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      setTeamError(null);

      const response = await fetch(`/api/orgs/${session.user.orgId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
        },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to remove member');
      }

      setTeamSuccess('Team member removed successfully');
      fetchTeamMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      setTeamError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string): string => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role);
    return roleOption?.label || role;
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      case 'OPERATOR':
        return 'bg-blue-100 text-blue-700';
      case 'PM':
        return 'bg-purple-100 text-purple-700';
      case 'CLIENT':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Save general settings (preferences)
  const handleSaveGeneral = async () => {
    try {
      setSavingGeneral(true);
      setError(null);

      const response = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save settings');
      }

      setSuccess('General settings saved successfully');
    } catch (err) {
      console.error('Error saving general settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      setError(null);

      const response = await fetch('/api/users/me/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save notification settings');
      }

      setSuccess('Notification preferences saved successfully');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save notification settings');
    } finally {
      setSavingNotifications(false);
    }
  };

  // Save organization settings
  const handleSaveOrg = async () => {
    if (!session?.user?.orgId) {
      setError('You are not part of an organization');
      return;
    }

    try {
      setSavingOrg(true);
      setError(null);

      const response = await fetch(`/api/orgs/${session.user.orgId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
        },
        body: JSON.stringify({
          name: orgSettings.name,
          slug: orgSettings.slug || undefined,
          website: orgSettings.website || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to save organization settings');
      }

      // Update local state with response data
      setOrgSettings(prev => ({
        ...prev,
        name: data.name || prev.name,
        slug: data.slug || prev.slug,
        website: data.website || prev.website,
      }));

      setSuccess('Organization settings saved successfully');
    } catch (err) {
      console.error('Error saving organization settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save organization settings');
    } finally {
      setSavingOrg(false);
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle organization setting changes
  const handleOrgChange = (field: keyof OrgSettings, value: string) => {
    setOrgSettings(prev => ({ ...prev, [field]: value }));
  };

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
        <h1 className="text-3xl font-bold text-astralis-navy">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and organization settings</p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert variant="success" showIcon>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="error" showIcon>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic application preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <Button
                variant="primary"
                className="gap-2"
                onClick={handleSaveGeneral}
                disabled={savingGeneral}
              >
                {savingGeneral && <Loader2 className="h-5 w-5 animate-spin" />}
                {savingGeneral ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Timezone Preferences</CardTitle>
                  <CardDescription>Configure your timezone settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimezoneSelector
                currentTimezone={userTimezone}
                onSuccess={(newTimezone) => {
                  setUserTimezone(newTimezone);
                  setSuccess('Timezone preference updated successfully');
                  setError(null);
                }}
                onError={(errorMessage) => {
                  setError(errorMessage);
                }}
              />
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
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
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Manage your organization details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgSettings.name}
                  onChange={(e) => handleOrgChange('name', e.target.value)}
                  placeholder="My Organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSlug">Organization Slug</Label>
                <Input
                  id="orgSlug"
                  value={orgSettings.slug}
                  onChange={(e) => handleOrgChange('slug', e.target.value)}
                  placeholder="my-organization"
                />
                <p className="text-xs text-slate-500">Used in URLs and API requests</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgWebsite">Website</Label>
                <Input
                  id="orgWebsite"
                  type="url"
                  value={orgSettings.website}
                  onChange={(e) => handleOrgChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <Button
                variant="primary"
                className="gap-2"
                onClick={handleSaveOrg}
                disabled={savingOrg}
              >
                {savingOrg && <Loader2 className="h-5 w-5 animate-spin" />}
                {savingOrg ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive email updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task Notifications</p>
                    <p className="text-sm text-slate-500">Get notified about task updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.taskNotifications}
                    onChange={() => handleNotificationToggle('taskNotifications')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Booking Reminders</p>
                    <p className="text-sm text-slate-500">Reminders for upcoming bookings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.bookingReminders}
                    onChange={() => handleNotificationToggle('bookingReminders')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-slate-500">Important security notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.securityAlerts}
                    onChange={() => handleNotificationToggle('securityAlerts')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-slate-500">Weekly activity summary</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={() => handleNotificationToggle('weeklyDigest')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-slate-500">New features and improvements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={() => handleNotificationToggle('productUpdates')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-slate-500">Promotional content and offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.marketingEmails}
                    onChange={() => handleNotificationToggle('marketingEmails')}
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                className="gap-2"
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
              >
                {savingNotifications && <Loader2 className="h-5 w-5 animate-spin" />}
                {savingNotifications ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your security preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                      Enable
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-slate-500">Update your password</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                      Change
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-slate-500">Manage your active sessions</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="info" showIcon>
                <AlertTitle>Current Plan: Pro</AlertTitle>
                <AlertDescription>
                  Your next billing date is January 15, 2025
                </AlertDescription>
              </Alert>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-slate-500">Visa ending in 4242</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                    Update
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                  View Invoices
                </Button>
                <Button variant="primary" size="sm" className="gap-1.5 text-sm">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team and permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Alerts */}
              {teamSuccess && (
                <Alert variant="success" showIcon>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{teamSuccess}</AlertDescription>
                </Alert>
              )}

              {teamError && (
                <Alert variant="error" showIcon>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{teamError}</AlertDescription>
                </Alert>
              )}

              {/* Header with invite button */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-sm"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </div>

              {/* Team members list */}
              <div className="space-y-3">
                {loadingTeam ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-astralis-blue" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No team members yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Invite team members to collaborate on your organization
                    </p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-astralis-blue flex items-center justify-center text-white font-semibold">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name || member.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            (member.name?.charAt(0) || member.email.charAt(0)).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.name || member.email.split('@')[0]}
                            {member.id === session?.user?.id && (
                              <span className="text-slate-500 font-normal ml-1">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {getRoleDisplayName(member.role)}
                        </span>
                        {member.id !== session?.user?.id && session?.user?.role === UserRole.ADMIN && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization. They will receive an email with instructions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={inviteRole}
                onValueChange={(value: InviteRole) => setInviteRole(value)}
                disabled={inviting}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {ROLE_OPTIONS.find((r) => r.value === inviteRole)?.description}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInviteModalOpen(false);
                setInviteEmail('');
                setInviteRole('USER');
              }}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleInviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="gap-1.5"
            >
              {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
              {inviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
