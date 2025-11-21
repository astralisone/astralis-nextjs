"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar as GoogleIcon,
  Mail as MicrosoftIcon,
  Apple as AppleIcon,
  RefreshCw,
  Unlink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface CalendarConnection {
  id: string;
  provider: "google" | "microsoft" | "apple";
  email: string;
  lastSyncedAt: Date | string;
  syncErrorCount?: number;
  syncErrorMessage?: string;
  isActive: boolean;
}

interface CalendarConnectionCardProps {
  connection: CalendarConnection;
  onDisconnect: () => void;
  onSync: () => void;
}

const PROVIDER_CONFIG = {
  google: {
    name: "Google Calendar",
    icon: GoogleIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  microsoft: {
    name: "Microsoft Outlook",
    icon: MicrosoftIcon,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  apple: {
    name: "Apple Calendar",
    icon: AppleIcon,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
  },
};

export function CalendarConnectionCard({
  connection,
  onDisconnect,
  onSync,
}: CalendarConnectionCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const config = PROVIDER_CONFIG[connection.provider];
  const ProviderIcon = config.icon;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const lastSyncDate = new Date(connection.lastSyncedAt);
  const lastSyncText = formatDistanceToNow(lastSyncDate, { addSuffix: true });

  const hasSyncErrors =
    connection.syncErrorCount && connection.syncErrorCount > 0;

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-shadow">
      <CardHeader
        className={`${config.bgColor} border-b border-slate-200 pb-4`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-lg ${config.color}`}>
              <ProviderIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{connection.email}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              connection.isActive
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {connection.isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Active</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                <span>Inactive</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Last Sync Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Last synced:</span>
            <span className="font-medium text-slate-900">{lastSyncText}</span>
          </div>

          {/* Sync Error Indicator */}
          {hasSyncErrors && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Sync Error ({connection.syncErrorCount}{" "}
                  {connection.syncErrorCount === 1 ? "attempt" : "attempts"})
                </p>
                {connection.syncErrorMessage && (
                  <p className="text-xs text-red-700 mt-1">
                    {connection.syncErrorMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || isDisconnecting}
            className="flex-1 gap-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Sync Now</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isSyncing || isDisconnecting}
            className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Disconnecting...</span>
              </>
            ) : (
              <>
                <Unlink className="h-4 w-4" />
                <span>Disconnect</span>
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Connection ID: {connection.id.slice(0, 8)}...</span>
            {connection.isActive && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Auto-sync enabled</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
