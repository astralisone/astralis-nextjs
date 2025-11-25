"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Clock,
  Server,
  Database,
  Cpu,
  FileText,
  RefreshCw,
} from "lucide-react";
import { API_ROUTES, getRoutesByCategory, type APIRoute } from "@/lib/api-registry";

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  version: string;
  environment: string;
  services: {
    database: {
      status: "connected" | "disconnected" | "error";
      latency?: number;
      error?: string;
    };
    redis?: {
      status: "connected" | "disconnected" | "not_configured";
    };
  };
  apis: {
    total: number;
    byCategory: Record<string, number>;
  };
  serverLogs: {
    path: string;
    description: string;
  };
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "healthy":
    case "connected":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
    case "not_configured":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "unhealthy":
    case "disconnected":
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
  }
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-yellow-100 text-yellow-700",
    PATCH: "bg-orange-100 text-orange-700",
    DELETE: "bg-red-100 text-red-700",
    HEAD: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[method] || "bg-gray-100 text-gray-700"}`}
    >
      {method}
    </span>
  );
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Failed to fetch health status");
      const data = await res.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group routes by category (using shared utility)
  const routesByCategory = getRoutesByCategory();

  const getCodeLink = (path: string) => {
    // Convert API path to approximate file path
    const filePath = path
      .replace("/api/", "src/app/api/")
      .replace(/\[\.\.\.([^\]]+)\]/g, "[...$1]")
      .replace(/\[([^\]]+)\]/g, "[$1]");
    return `https://github.com/astralisone/astralis-nextjs/blob/main/${filePath}/route.ts`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">System Health</h1>
            <p className="text-slate-600 mt-1">
              Monitor system status and API endpoints
            </p>
          </div>
          <Button
            onClick={fetchHealth}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Main Health Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <StatusIcon status={health?.status || "unknown"} />
              <div>
                <h2 className="text-xl font-semibold text-astralis-navy capitalize">
                  {health?.status || "Loading..."}
                </h2>
                <p className="text-sm text-slate-500">
                  {health?.timestamp
                    ? new Date(health.timestamp).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Environment</div>
              <div className="font-medium text-astralis-navy capitalize">
                {health?.environment || "-"}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Uptime */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Uptime</span>
              </div>
              <div className="text-lg font-semibold text-astralis-navy">
                {health?.uptime.formatted || "-"}
              </div>
            </div>

            {/* Database */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Database className="h-4 w-4" />
                <span className="text-sm">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={health?.services.database.status || "unknown"} />
                <span className="text-sm font-medium capitalize">
                  {health?.services.database.status || "-"}
                </span>
                {health?.services.database.latency && (
                  <span className="text-xs text-slate-500">
                    ({health.services.database.latency}ms)
                  </span>
                )}
              </div>
            </div>

            {/* Redis */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">Redis</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={health?.services.redis?.status || "unknown"} />
                <span className="text-sm font-medium capitalize">
                  {health?.services.redis?.status?.replace("_", " ") || "-"}
                </span>
              </div>
            </div>

            {/* API Count */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Server className="h-4 w-4" />
                <span className="text-sm">API Routes</span>
              </div>
              <div className="text-lg font-semibold text-astralis-navy">
                {health?.apis.total || API_ROUTES.length}
              </div>
            </div>
          </div>
        </div>

        {/* More Details Drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-6">
              <ChevronDown className="h-4 w-4 mr-2" />
              More Details
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Details
              </SheetTitle>
              <SheetDescription>
                Uptime, server logs, and complete API registry
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Uptime Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-astralis-navy mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Uptime
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Duration:</span>
                    <span className="ml-2 font-medium">
                      {health?.uptime.formatted || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Seconds:</span>
                    <span className="ml-2 font-medium">
                      {health?.uptime.seconds
                        ? Math.floor(health.uptime.seconds).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Version:</span>
                    <span className="ml-2 font-medium">
                      {health?.version || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Environment:</span>
                    <span className="ml-2 font-medium capitalize">
                      {health?.environment || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Server Logs Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-astralis-navy mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Server Logs
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {health?.serverLogs.description || "PM2 application logs"}
                    </span>
                  </div>
                  <code className="block bg-slate-200 px-3 py-2 rounded text-xs font-mono">
                    {health?.serverLogs.path || "/var/log/pm2/astralis-*.log"}
                  </code>
                  <div className="text-xs text-slate-500 mt-2">
                    Access via SSH: <code className="bg-slate-200 px-1 rounded">pm2 logs astralis-nextjs</code>
                  </div>
                </div>
              </div>

              {/* API Routes Section */}
              <div>
                <h3 className="font-semibold text-astralis-navy mb-3 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  API Routes ({API_ROUTES.length} total)
                </h3>

                <div className="space-y-2">
                  {Object.entries(routesByCategory).map(([category, routes]) => (
                    <div key={category} className="border border-slate-200 rounded-lg">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-astralis-navy">
                          {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">
                            {routes.length} routes
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                              expandedCategories.has(category) ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {expandedCategories.has(category) && (
                        <div className="border-t border-slate-200 p-3 space-y-3">
                          {routes.map((route) => (
                            <div
                              key={route.path}
                              className="text-sm bg-slate-50 rounded p-2"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <code className="text-xs font-mono text-astralis-navy">
                                  {route.path}
                                </code>
                                <a
                                  href={getCodeLink(route.path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-astralis-blue hover:underline flex items-center gap-1 text-xs"
                                >
                                  Code
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-1">
                                {route.methods.map((method) => (
                                  <MethodBadge key={method} method={method} />
                                ))}
                              </div>
                              <p className="text-xs text-slate-600">
                                {route.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick API Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-astralis-navy mb-4">
            API Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(routesByCategory).map(([category, routes]) => (
              <div
                key={category}
                className="bg-slate-50 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-astralis-blue">
                  {routes.length}
                </div>
                <div className="text-sm text-slate-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
