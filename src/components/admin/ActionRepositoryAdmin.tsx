'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { ActionDefinition, ActionStatus, IntegrationProvider } from '@/lib/types/action';

interface ActionRepositoryAdminProps {
  orgId: string;
}

export function ActionRepositoryAdmin({ orgId }: ActionRepositoryAdminProps) {
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<IntegrationProvider | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(null);

  // Load actions on mount and when filters change
  useEffect(() => {
    loadActions();
  }, [searchQuery, statusFilter, providerFilter]);

  const loadActions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (providerFilter !== 'all') params.set('provider', providerFilter);

      const response = await fetch(`/api/admin/actions?${params}`);
      if (!response.ok) throw new Error('Failed to load actions');

      const data = await response.json();
      setActions(data.actions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (actionId: string, newStatus: ActionStatus) => {
    try {
      const response = await fetch(`/api/admin/actions/${actionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setActions(actions.map(action =>
        action.id === actionId ? { ...action, status: newStatus } : action
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/actions/${actionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete action');

      // Remove from local state
      setActions(actions.filter(action => action.id !== actionId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete action');
    }
  };

  const handleDiscoverActions = async () => {
    if (!confirm('This will scan all available integrations and discover new actions using AI. This may take a few minutes. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/actions/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to discover actions');
      }

      const result = await response.json();

      // Show results
      const successCount = result.results.filter((r: any) => r.status === 'success').length;
      const totalActions = result.totalDiscovered;

      alert(`Action discovery completed!\n\n${successCount} integrations processed\n${totalActions} new actions discovered\n\nCheck the action list below for the newly discovered actions.`);

      // Refresh the actions list
      loadActions();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover actions');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (action: ActionDefinition) => {
    // Open execution modal or inline form
    const params = prompt(`Enter parameters for ${action.name} (JSON format):`, '{}');
    if (!params) return;

    try {
      const parsedParams = JSON.parse(params);
      const response = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionKey: action.actionKey,
          params: parsedParams,
          orgId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Action executed successfully!');
        loadActions(); // Refresh to show updated stats
      } else {
        alert(`Action failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Execution error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-[24px] w-[24px] text-green-500" />;
      case 'INACTIVE':
        return <Clock className="h-[24px] w-[24px] text-yellow-500" />;
      case 'DEPRECATED':
        return <AlertTriangle className="h-[24px] w-[24px] text-orange-500" />;
      case 'BROKEN':
        return <AlertTriangle className="h-[24px] w-[24px] text-red-500" />;
      default:
        return <Clock className="h-[24px] w-[24px] text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: ActionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'DEPRECATED':
        return 'destructive';
      case 'BROKEN':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const formatAge = (createdAt: Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Action Repository</h1>
          <p className="text-slate-600 mt-1">
            Manage AI-discovered actions for integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadActions}
            disabled={loading}
          >
            <RefreshCw className={`h-[24px] w-[24px] mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleDiscoverActions} disabled={loading}>
            <Plus className="h-[24px] w-[24px] mr-2" />
            Discover Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{actions.length}</p>
                <p className="text-sm text-slate-600">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {actions.filter(a => a.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-slate-600">Active Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {actions.reduce((sum, a) => sum + a.executionCount, 0)}
                </p>
                <p className="text-sm text-slate-600">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {actions.filter(a => a.status === 'BROKEN').length}
                </p>
                <p className="text-sm text-slate-600">Broken Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[24px] w-[24px] text-slate-400" />
              <Input
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                <SelectItem value="BROKEN">Broken</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={providerFilter}
              onValueChange={(value: any) => setProviderFilter(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="GMAIL">Gmail</SelectItem>
                <SelectItem value="GOOGLE_DRIVE">Google Drive</SelectItem>
                <SelectItem value="GOOGLE_DOCS">Google Docs</SelectItem>
                <SelectItem value="GOOGLE_SHEETS">Google Sheets</SelectItem>
                <SelectItem value="GOOGLE_CALENDAR">Google Calendar</SelectItem>
                <SelectItem value="SLACK">Slack</SelectItem>
                <SelectItem value="DROPBOX">Dropbox</SelectItem>
                <SelectItem value="HUBSPOT">HubSpot</SelectItem>
                <SelectItem value="SALESFORCE">Salesforce</SelectItem>
                <SelectItem value="QUICKBOOKS">QuickBooks</SelectItem>
                <SelectItem value="XERO">Xero</SelectItem>
                <SelectItem value="SHOPIFY">Shopify</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="MICROSOFT_TEAMS">Microsoft Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-[24px] w-[24px]" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Actions ({actions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading actions...</p>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No actions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{action.name}</p>
                        <p className="text-sm text-slate-600">{action.description}</p>
                        <div className="flex gap-1 mt-1">
                          {action.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{action.provider}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(action.status)}
                        <Select
                          value={action.status}
                          onValueChange={(value: ActionStatus) =>
                            handleStatusChange(action.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                            <SelectItem value="BROKEN">Broken</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{action.executionCount}</span>
                    </TableCell>
                    <TableCell>
                      {formatDate(action.lastExecutedAt)}
                    </TableCell>
                    <TableCell>
                      {formatAge(action.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecute(action)}
                        >
                          <Play className="h-[24px] w-[24px]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAction(action)}
                        >
                          <Edit className="h-[24px] w-[24px]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(action.id)}
                        >
                          <Trash2 className="h-[24px] w-[24px]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Detail Modal would go here */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedAction.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(selectedAction, null, 2)}
              </pre>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}