"use client";

/**
 * Engagement Management Component
 * Admin interface for viewing, editing, and managing client engagements
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks';
import api from '@/lib/api';
import { ClientCommunication } from './ClientCommunication';

// Types
interface Engagement {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  billingModel: 'TIME_AND_MATERIALS' | 'FIXED_FEE' | 'RETAINER';
  budgetAmount?: number;
  budgetCurrency?: string;
  startDate?: string;
  targetEndDate?: string;
  scopeSummary?: string;
  acceptanceCriteria?: string;
  repoStrategy?: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    industry?: string;
  };
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isPrimary: boolean;
  }>;
  _count?: {
    milestones: number;
    accessRequests: number;
    environments: number;
  };
}

interface EngagementFilters {
  status?: string;
  billingModel?: string;
  company?: string;
  dateRange?: string;
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/30',
  PAUSED: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const BILLING_MODEL_LABELS = {
  TIME_AND_MATERIALS: 'Time & Materials',
  FIXED_FEE: 'Fixed Fee',
  RETAINER: 'Retainer'
};

export function EngagementManagement() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [filteredEngagements, setFilteredEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EngagementFilters>({});
  const [selectedEngagements, setSelectedEngagements] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Engagement>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch engagements from API
   */
  const fetchEngagements = useCallback(async () => {
    try {
      setLoading(true);

      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');

      const response = await api.get('/admin/engagements');
      setEngagements(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch engagements:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load engagements. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Apply filters and search
   */
  const applyFilters = useCallback(() => {
    let filtered = [...engagements];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(engagement =>
        engagement.name.toLowerCase().includes(term) ||
        engagement.company.name.toLowerCase().includes(term) ||
        engagement.contacts.some(contact =>
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term)
        )
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(engagement => engagement.status === filters.status);
    }

    // Billing model filter
    if (filters.billingModel && filters.billingModel !== 'all') {
      filtered = filtered.filter(engagement => engagement.billingModel === filters.billingModel);
    }

    // Date range filter (simplified - last 30 days, 90 days, etc.)
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      filtered = filtered.filter(engagement =>
        new Date(engagement.createdAt) >= cutoffDate
      );
    }

    setFilteredEngagements(filtered);
  }, [engagements, searchTerm, filters]);

  /**
   * Handle engagement status update
   */
  const updateEngagementStatus = async (engagementId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/engagements/${engagementId}`, { status: newStatus });

      setEngagements(prev => prev.map(engagement =>
        engagement.id === engagementId
          ? { ...engagement, status: newStatus as any }
          : engagement
      ));

      toast({
        title: 'Success',
        description: 'Engagement status updated successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update engagement status.',
        variant: 'destructive'
      });
    }
  };

  /**
   * Handle engagement deletion
   */
  const deleteEngagement = async (engagementId: string) => {
    if (!confirm('Are you sure you want to delete this engagement? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/engagements/${engagementId}`);

      setEngagements(prev => prev.filter(engagement => engagement.id !== engagementId));

      toast({
        title: 'Success',
        description: 'Engagement deleted successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete engagement.',
        variant: 'destructive'
      });
    }
  };

  /**
   * Open edit modal
   */
  const openEditModal = (engagement: Engagement) => {
    setEditingEngagement(engagement);
    setEditFormData({
      name: engagement.name,
      status: engagement.status,
      billingModel: engagement.billingModel,
      budgetAmount: engagement.budgetAmount,
      budgetCurrency: engagement.budgetCurrency || 'USD',
      startDate: engagement.startDate ? engagement.startDate.split('T')[0] : '',
      targetEndDate: engagement.targetEndDate ? engagement.targetEndDate.split('T')[0] : '',
      scopeSummary: engagement.scopeSummary || '',
      acceptanceCriteria: engagement.acceptanceCriteria || '',
      repoStrategy: engagement.repoStrategy || '',
    });
    setEditDialogOpen(true);
  };

  /**
   * Close edit modal
   */
  const closeEditModal = () => {
    setEditDialogOpen(false);
    setEditingEngagement(null);
    setEditFormData({});
    setIsUpdating(false);
  };

  /**
   * Handle form input changes
   */
  const handleFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Submit engagement update
   */
  const submitEngagementUpdate = async () => {
    if (!editingEngagement) return;

    try {
      setIsUpdating(true);

      // Prepare update data
      const updateData: any = {};

      if (editFormData.name !== editingEngagement.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.status !== editingEngagement.status) {
        updateData.status = editFormData.status;
      }
      if (editFormData.billingModel !== editingEngagement.billingModel) {
        updateData.billingModel = editFormData.billingModel;
      }
      if (editFormData.budgetAmount !== editingEngagement.budgetAmount) {
        updateData.budgetAmount = editFormData.budgetAmount;
      }
      if (editFormData.budgetCurrency !== editingEngagement.budgetCurrency) {
        updateData.budgetCurrency = editFormData.budgetCurrency;
      }
      if (editFormData.startDate) {
        const startDate = new Date(editFormData.startDate);
        updateData.startDate = startDate.toISOString();
      }
      if (editFormData.targetEndDate) {
        const endDate = new Date(editFormData.targetEndDate);
        updateData.targetEndDate = endDate.toISOString();
      }
      if (editFormData.scopeSummary !== editingEngagement.scopeSummary) {
        updateData.scopeSummary = editFormData.scopeSummary;
      }
      if (editFormData.acceptanceCriteria !== editingEngagement.acceptanceCriteria) {
        updateData.acceptanceCriteria = editFormData.acceptanceCriteria;
      }
      if (editFormData.repoStrategy !== editingEngagement.repoStrategy) {
        updateData.repoStrategy = editFormData.repoStrategy;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to the engagement.',
        });
        closeEditModal();
        return;
      }

      const response = await api.patch(`/admin/engagements/${editingEngagement.id}`, updateData);

      // Update the engagement in the local state
      setEngagements(prev => prev.map(engagement =>
        engagement.id === editingEngagement.id
          ? { ...engagement, ...response.data.data }
          : engagement
      ));

      toast({
        title: 'Success',
        description: 'Engagement updated successfully.'
      });

      closeEditModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update engagement.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  /**
   * Format date
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load engagements on mount
  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Engagement Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="glass-card border-neutral-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/2"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Engagement Management</h1>
          <p className="text-gray-400">Manage client engagements and project details</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          New Engagement
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-neutral-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search engagements, companies, or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-neutral-800/50 border-neutral-600 text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Billing Model Filter */}
            <Select value={filters.billingModel || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, billingModel: value }))}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white">
                <SelectValue placeholder="All Billing Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Models</SelectItem>
                <SelectItem value="TIME_AND_MATERIALS">Time & Materials</SelectItem>
                <SelectItem value="FIXED_FEE">Fixed Fee</SelectItem>
                <SelectItem value="RETAINER">Retainer</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={filters.dateRange || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {filteredEngagements.length} of {engagements.length} engagements
        </p>
        {selectedEngagements.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {selectedEngagements.size} selected
            </span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Engagements List */}
      <div className="grid gap-4">
        {filteredEngagements.length === 0 ? (
          <Card className="glass-card border-neutral-700">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No engagements found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first engagement'
                }
              </p>
              {!searchTerm && !Object.values(filters).some(f => f && f !== 'all') && (
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Engagement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEngagements.map((engagement) => (
            <Card key={engagement.id} className="glass-card border-neutral-700 hover:border-neutral-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {engagement.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {engagement.company.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created {formatDate(engagement.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={STATUS_COLORS[engagement.status]}>
                          {engagement.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(engagement)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <ClientCommunication
                              engagement={engagement}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Contact Client
                                </DropdownMenuItem>
                              }
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => deleteEngagement(engagement.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Billing */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Billing Model</p>
                        <p className="text-sm text-white">
                          {BILLING_MODEL_LABELS[engagement.billingModel]}
                        </p>
                      </div>

                      {/* Budget */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Budget</p>
                        <p className="text-sm text-white">
                          {formatCurrency(engagement.budgetAmount, engagement.budgetCurrency)}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Timeline</p>
                        <p className="text-sm text-white">
                          {engagement.startDate && engagement.targetEndDate
                            ? `${formatDate(engagement.startDate)} - ${formatDate(engagement.targetEndDate)}`
                            : 'Not set'
                          }
                        </p>
                      </div>

                      {/* Primary Contact */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Primary Contact</p>
                        <p className="text-sm text-white">
                          {engagement.contacts.find(c => c.isPrimary)?.firstName || 'Not set'} {engagement.contacts.find(c => c.isPrimary)?.lastName || ''}
                        </p>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    {engagement._count && (
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {engagement._count.milestones} Milestones
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {engagement.contacts.length} Contacts
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {engagement._count.accessRequests} Access Requests
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Engagement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Engagement</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the engagement details below.
            </DialogDescription>
          </DialogHeader>

          {editingEngagement && (
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Basic Information</h4>

                <div>
                  <Label htmlFor="name" className="text-gray-200">Engagement Name</Label>
                  <Input
                    id="name"
                    value={editFormData.name || ''}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="bg-neutral-800/50 border-neutral-600 text-white mt-1"
                    placeholder="Enter engagement name"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(editFormData.name || '').length}/100 characters
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-gray-200">Status</Label>
                    <Select
                      value={editFormData.status || ''}
                      onValueChange={(value) => handleFormChange('status', value)}
                    >
                      <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="billingModel" className="text-gray-200">Billing Model</Label>
                    <Select
                      value={editFormData.billingModel || ''}
                      onValueChange={(value) => handleFormChange('billingModel', value)}
                    >
                      <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white mt-1">
                        <SelectValue placeholder="Select billing model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIME_AND_MATERIALS">Time & Materials</SelectItem>
                        <SelectItem value="FIXED_FEE">Fixed Fee</SelectItem>
                        <SelectItem value="RETAINER">Retainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial & Timeline Information */}
              <div className="space-y-4 border-t border-neutral-700 pt-4">
                <h4 className="text-lg font-medium text-white">Financial & Timeline</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetAmount" className="text-gray-200">Budget Amount</Label>
                    <Input
                      id="budgetAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.budgetAmount || ''}
                      onChange={(e) => handleFormChange('budgetAmount', parseFloat(e.target.value) || null)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budgetCurrency" className="text-gray-200">Currency</Label>
                    <Select
                      value={editFormData.budgetCurrency || 'USD'}
                      onValueChange={(value) => handleFormChange('budgetCurrency', value)}
                    >
                      <SelectTrigger className="bg-neutral-800/50 border-neutral-600 text-white mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-gray-200">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editFormData.startDate || ''}
                      onChange={(e) => handleFormChange('startDate', e.target.value)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetEndDate" className="text-gray-200">Target End Date</Label>
                    <Input
                      id="targetEndDate"
                      type="date"
                      value={editFormData.targetEndDate || ''}
                      onChange={(e) => handleFormChange('targetEndDate', e.target.value)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1"
                    />
                  </div>
                </div>

                {/* Project Details Section */}
                <div className="space-y-4 border-t border-neutral-700 pt-4">
                  <h4 className="text-lg font-medium text-white">Project Details</h4>

                  <div>
                    <Label htmlFor="scopeSummary" className="text-gray-200">Scope Summary</Label>
                    <Textarea
                      id="scopeSummary"
                      value={editFormData.scopeSummary || ''}
                      onChange={(e) => handleFormChange('scopeSummary', e.target.value)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1 min-h-24"
                      placeholder="Describe the overall scope and objectives of this engagement..."
                      maxLength={2000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(editFormData.scopeSummary || '').length}/2000 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="acceptanceCriteria" className="text-gray-200">Acceptance Criteria</Label>
                    <Textarea
                      id="acceptanceCriteria"
                      value={editFormData.acceptanceCriteria || ''}
                      onChange={(e) => handleFormChange('acceptanceCriteria', e.target.value)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1 min-h-24"
                      placeholder="Define the criteria for successful completion of this engagement..."
                      maxLength={2000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(editFormData.acceptanceCriteria || '').length}/2000 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="repoStrategy" className="text-gray-200">Repository Strategy</Label>
                    <Textarea
                      id="repoStrategy"
                      value={editFormData.repoStrategy || ''}
                      onChange={(e) => handleFormChange('repoStrategy', e.target.value)}
                      className="bg-neutral-800/50 border-neutral-600 text-white mt-1 min-h-20"
                      placeholder="Describe the repository setup, branching strategy, and development workflow..."
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(editFormData.repoStrategy || '').length}/1000 characters
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400 p-3 bg-neutral-800/30 rounded-md">
                  <strong>Company:</strong> {editingEngagement.company.name}
                  {editingEngagement.company.industry && (
                    <span> • <strong>Industry:</strong> {editingEngagement.company.industry}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditModal}
              disabled={isUpdating}
              className="border-neutral-600 text-gray-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={submitEngagementUpdate}
              disabled={isUpdating}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isUpdating ? 'Updating...' : 'Update Engagement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
