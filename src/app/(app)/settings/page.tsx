'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-astralis-navy">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and organization settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
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
                  defaultValue="America/New_York"
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
                  defaultValue="MM/DD/YYYY"
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
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <Button variant="primary" size="sm" className="gap-1.5 text-sm">
                Save Changes
              </Button>
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
                <Input id="orgName" defaultValue="My Organization" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSlug">Organization Slug</Label>
                <Input id="orgSlug" defaultValue="my-organization" />
                <p className="text-xs text-slate-500">Used in URLs and API requests</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgWebsite">Website</Label>
                <Input id="orgWebsite" type="url" placeholder="https://example.com" />
              </div>

              <Button variant="primary" size="sm" className="gap-1.5 text-sm">
                Save Changes
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
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pipeline Updates</p>
                    <p className="text-sm text-slate-500">Get notified about pipeline changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Document Processing</p>
                    <p className="text-sm text-slate-500">Alerts when documents are processed</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Summary</p>
                    <p className="text-sm text-slate-500">Weekly activity digest</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5" />
                </div>
              </div>

              <Button variant="primary" size="sm" className="gap-1.5 text-sm">
                Save Preferences
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">3 of 10 seats used</p>
                </div>
                <Button variant="primary" size="sm" className="gap-1.5 text-sm">
                  Invite Member
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-astralis-blue flex items-center justify-center text-white font-semibold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{session?.user?.name || 'You'}</p>
                      <p className="text-sm text-slate-500">{session?.user?.email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-astralis-blue">Owner</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
