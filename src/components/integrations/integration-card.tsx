'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IntegrationIcon } from './integration-icon';
import type { IntegrationMetadata, ConnectedIntegration } from '@/types/integrations';
import {
  MoreVertical,
  ExternalLink,
  RefreshCw,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface IntegrationCardProps {
  integration: IntegrationMetadata;
  connection?: ConnectedIntegration;
  onConnect: () => void;
  onDisconnect: (id: string) => void;
  onTest: (id: string) => void;
  isConnecting?: boolean;
  isTesting?: boolean;
}

export function IntegrationCard({
  integration,
  connection,
  onConnect,
  onDisconnect,
  onTest,
  isConnecting,
  isTesting,
}: IntegrationCardProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const isConnected = !!connection && connection.status === 'connected';
  const isExpired = connection?.status === 'expired';
  const hasError = connection?.status === 'error';

  const getStatusBadge = () => {
    if (!connection) return null;

    switch (connection.status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <Check className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <Clock className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <X className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  const handleDisconnect = () => {
    if (connection) {
      onDisconnect(connection.id);
    }
    setShowDisconnectDialog(false);
  };

  return (
    <>
      <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
        <div
          className="absolute left-0 top-0 h-1 w-full"
          style={{ backgroundColor: integration.color }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: `${integration.color}15` }}
              >
                <IntegrationIcon
                  provider={integration.provider}
                  className="h-6 w-6"
                  style={{ color: integration.color }}
                />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <Badge variant="outline" className="mt-1 text-xs capitalize">
                  {integration.category}
                </Badge>
              </div>
            </div>

            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => connection && onTest(connection.id)}
                    disabled={isTesting}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isTesting ? 'animate-spin' : ''}`} />
                    Test Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={getProviderSettingsUrl(integration.provider)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open {integration.name}
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDisconnectDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="mb-4 line-clamp-2">
            {integration.description}
          </CardDescription>

          <div className="flex items-center justify-between">
            {getStatusBadge()}

            {!isConnected ? (
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                size="sm"
                style={{
                  backgroundColor: integration.color,
                  borderColor: integration.color,
                }}
                className="hover:opacity-90"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            ) : isExpired || hasError ? (
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                size="sm"
                variant="outline"
              >
                Reconnect
              </Button>
            ) : (
              connection?.lastUsedAt && (
                <span className="text-xs text-muted-foreground">
                  Last used:{' '}
                  {new Date(connection.lastUsedAt).toLocaleDateString()}
                </span>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {integration.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection to {integration.name}. Any automations
              using this integration will stop working until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getProviderSettingsUrl(provider: string): string {
  const urls: Record<string, string> = {
    QUICKBOOKS: 'https://accounts.intuit.com',
    XERO: 'https://go.xero.com',
    HUBSPOT: 'https://app.hubspot.com',
    SALESFORCE: 'https://login.salesforce.com',
    SLACK: 'https://slack.com',
    GMAIL: 'https://mail.google.com',
    MICROSOFT_TEAMS: 'https://teams.microsoft.com',
    GOOGLE_DRIVE: 'https://drive.google.com',
    DROPBOX: 'https://www.dropbox.com',
  };
  return urls[provider] || '#';
}
