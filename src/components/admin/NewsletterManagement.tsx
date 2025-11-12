"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Mail,
  Users,
  TrendingUp,
  Send,
  Eye,
  MousePointer,
  UserMinus,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Download,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminLayout";

interface NewsletterStats {
  totals: {
    totalSubscribers: number;
    activeSubscribers: number;
    pendingSubscribers: number;
    unsubscribedCount: number;
    totalCampaigns: number;
  };
  recentCampaigns: Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    totalRecipients: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    createdAt: string;
    sentAt: string | null;
  }>;
  growth: Record<string, {
    total: number;
    active: number;
    pending: number;
  }>;
}

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED' | 'COMPLAINED';
  createdAt: string;
  confirmedAt: string | null;
  source: string | null;
  preferences?: {
    blogUpdates: boolean;
    productUpdates: boolean;
    marketplaceUpdates: boolean;
    eventNotifications: boolean;
    specialOffers: boolean;
    frequency: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  content: string;
  htmlContent: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED' | 'CANCELLED';
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  createdAt: string;
}

export function NewsletterManagement() {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState('all');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const { toast } = useToast();

  // Campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    preheader: '',
    content: '',
    htmlContent: '',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchStats();
    fetchSubscribers();
    fetchCampaigns();
  }, [subscribersPage, subscriberSearch, subscriberStatusFilter, campaignsPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/newsletter/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletter statistics",
        variant: "destructive"
      });
    }
  };

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams({
        page: subscribersPage.toString(),
        limit: '20',
        ...(subscriberSearch && { search: subscriberSearch }),
        ...(subscriberStatusFilter !== 'all' && { status: subscriberStatusFilter })
      });

      const response = await fetch(`/api/newsletter/admin/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.data.subscribers);
      } else {
        throw new Error('Failed to fetch subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive"
      });
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`/api/newsletter/admin/campaigns?page=${campaignsPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data.campaigns);
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Create HTML content if not provided
      let htmlContent = newCampaign.htmlContent;
      if (!htmlContent) {
        htmlContent = `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #ffffff; padding: 20px; border-radius: 12px;">
            <h1 style="color: #e5e7eb; margin-bottom: 20px;">${newCampaign.subject}</h1>
            <div style="line-height: 1.6; color: #9ca3af;">
              ${newCampaign.content.replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
      }

      const campaignData = {
        ...newCampaign,
        htmlContent,
        ...(newCampaign.scheduledAt && { scheduledAt: new Date(newCampaign.scheduledAt).toISOString() })
      };

      const response = await fetch('/api/newsletter/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign created successfully"
        });
        setShowCreateCampaign(false);
        setNewCampaign({
          name: '',
          subject: '',
          preheader: '',
          content: '',
          htmlContent: '',
          scheduledAt: ''
        });
        fetchCampaigns();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive"
      });
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/newsletter/admin/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Campaign sent successfully"
        });
        fetchCampaigns();
        fetchStats();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send campaign",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
      PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      UNSUBSCRIBED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      BOUNCED: 'bg-red-500/10 text-red-400 border-red-500/20',
      COMPLAINED: 'bg-red-500/10 text-red-400 border-red-500/20',
      DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SENDING: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      SENT: 'bg-green-500/10 text-green-400 border-green-500/20',
      PAUSED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    return (
      <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading newsletter data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Newsletter Management
            </h1>
            <p className="text-gray-400 mt-1">Manage subscribers, campaigns, and analytics</p>
          </div>
          <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-sm border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create Newsletter Campaign</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new newsletter campaign to send to your subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name" className="text-white">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Weekly AI Updates"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-subject" className="text-white">Email Subject *</Label>
                  <Input
                    id="campaign-subject"
                    placeholder="e.g., This Week in AI: Game-Changing Innovations"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-preheader" className="text-white">Preheader Text</Label>
                  <Input
                    id="campaign-preheader"
                    placeholder="Brief preview text that appears after the subject line"
                    value={newCampaign.preheader}
                    onChange={(e) => setNewCampaign({ ...newCampaign, preheader: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-content" className="text-white">Content *</Label>
                  <Textarea
                    id="campaign-content"
                    placeholder="Write your newsletter content here..."
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-html" className="text-white">HTML Content (Optional)</Label>
                  <Textarea
                    id="campaign-html"
                    placeholder="Custom HTML content (leave blank to auto-generate)"
                    value={newCampaign.htmlContent}
                    onChange={(e) => setNewCampaign({ ...newCampaign, htmlContent: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-schedule" className="text-white">Schedule (Optional)</Label>
                  <Input
                    id="campaign-schedule"
                    type="datetime-local"
                    value={newCampaign.scheduledAt}
                    onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateCampaign(false)}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCampaign}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                  >
                    Create Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Subscribers</p>
                    <p className="text-2xl font-bold text-white">{stats.totals.totalSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Active Subscribers</p>
                    <p className="text-2xl font-bold text-white">{stats.totals.activeSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-white">{stats.totals.pendingSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserMinus className="h-8 w-8 text-red-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Unsubscribed</p>
                    <p className="text-2xl font-bold text-white">{stats.totals.unsubscribedCount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-bold text-white">{stats.totals.totalCampaigns.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Users className="h-4 w-4 mr-2" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Mail className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Campaigns</CardTitle>
                <CardDescription className="text-gray-400">
                  Performance overview of your latest newsletter campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No campaigns found. Create your first campaign to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats?.recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{campaign.name}</h4>
                          <p className="text-sm text-gray-400">{campaign.subject}</p>
                          <p className="text-xs text-gray-500">
                            {campaign.sentAt ? `Sent ${formatDate(campaign.sentAt)}` : `Created ${formatDate(campaign.createdAt)}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="text-white font-medium">{campaign.totalRecipients}</p>
                            <p className="text-gray-400">Recipients</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{campaign.totalOpened}</p>
                            <p className="text-gray-400">Opens</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{campaign.totalClicked}</p>
                            <p className="text-gray-400">Clicks</p>
                          </div>
                          {getStatusBadge(campaign.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Subscribers</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your newsletter subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search subscribers..."
                        value={subscriberSearch}
                        onChange={(e) => setSubscriberSearch(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <Select value={subscriberStatusFilter} onValueChange={setSubscriberStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/10">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-white">
                              {subscriber.firstName || subscriber.lastName ?
                                `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() :
                                'Anonymous User'
                              }
                            </p>
                            <p className="text-sm text-gray-400">{subscriber.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Joined {formatDate(subscriber.createdAt)}</span>
                          {subscriber.confirmedAt && <span>Confirmed {formatDate(subscriber.confirmedAt)}</span>}
                          {subscriber.source && <span>Source: {subscriber.source}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {subscriber.preferences && (
                          <div className="flex space-x-1">
                            {subscriber.preferences.blogUpdates && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                                Blog
                              </Badge>
                            )}
                            {subscriber.preferences.productUpdates && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                                Products
                              </Badge>
                            )}
                            {subscriber.preferences.specialOffers && (
                              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                                Offers
                              </Badge>
                            )}
                          </div>
                        )}
                        {getStatusBadge(subscriber.status)}
                      </div>
                    </div>
                  ))}
                </div>

                {subscribers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No subscribers found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Campaigns</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your newsletter campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-6 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-white text-lg">{campaign.name}</h4>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-gray-300 mb-2">{campaign.subject}</p>
                          {campaign.preheader && (
                            <p className="text-sm text-gray-400 mb-3">{campaign.preheader}</p>
                          )}
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span>Created {formatDate(campaign.createdAt)}</span>
                            {campaign.sentAt && <span>Sent {formatDate(campaign.sentAt)}</span>}
                            {campaign.scheduledAt && !campaign.sentAt && (
                              <span>Scheduled for {formatDate(campaign.scheduledAt)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {campaign.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              onClick={() => handleSendCampaign(campaign.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Now
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Campaign Stats */}
                      {campaign.totalSent > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{campaign.totalRecipients.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Recipients</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-white">{campaign.totalSent.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Sent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-400">{campaign.totalOpened.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Opened</p>
                              {campaign.totalSent > 0 && (
                                <p className="text-xs text-gray-500">
                                  {((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-400">{campaign.totalClicked.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Clicked</p>
                              {campaign.totalSent > 0 && (
                                <p className="text-xs text-gray-500">
                                  {((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {campaigns.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No campaigns found. Create your first campaign to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
