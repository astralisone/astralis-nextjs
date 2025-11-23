'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { User, Mail, Building, Briefcase, Loader2 } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  bio: string;
  avatar: string | null;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    bio: '',
    avatar: null,
  });

  // Fetch profile data from API on mount
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users/me');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const { data } = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        teamSize: data.teamSize || '',
        bio: data.bio || '',
        avatar: data.avatar || null,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Fall back to session data if API fails
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          name: session.user?.name || '',
          email: session.user?.email || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user, fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          teamSize: formData.teamSize,
          bio: formData.bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const { data } = await response.json();

      // Update form with returned data
      setFormData({
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        teamSize: data.teamSize || '',
        bio: data.bio || '',
        avatar: data.avatar || null,
      });

      // Update session if name changed
      if (data.name !== session?.user?.name) {
        await update({ name: data.name });
      }

      setSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-astralis-navy">Profile</h1>
        <p className="text-slate-600 mt-1">Manage your personal information</p>
      </div>

      {success && (
        <Alert variant="success" showIcon>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your profile has been updated.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="error" showIcon>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AvatarUpload
              currentAvatarUrl={formData.avatar}
              userName={formData.name || session?.user?.name}
              onUploadSuccess={(newAvatarUrl) => {
                setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
                // Update session to reflect new avatar
                update({ image: newAvatarUrl });
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
              }}
              onDeleteSuccess={() => {
                setFormData((prev) => ({ ...prev, avatar: null }));
                // Update session to reflect removed avatar
                update({ image: null });
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
              }}
              onError={(errorMessage) => {
                setError(errorMessage);
              }}
              size="md"
              disabled={loading}
            />
            <div className="text-center">
              <p className="font-medium text-astralis-navy">{formData.name || session?.user?.name || 'User'}</p>
              <p className="text-sm text-slate-500">{formData.email || session?.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="john@example.com"
                    disabled
                  />
                </div>
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Acme Inc."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="teamSize"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="1-10, 11-50, 51-200, etc."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" className="gap-1.5 text-sm" disabled={loading || saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-sm"
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-error">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-error/20 rounded-lg bg-error/5">
            <div>
              <p className="font-medium text-error">Delete Account</p>
              <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-1.5 text-sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
