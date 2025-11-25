import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { API_ROUTES, getAPICounts } from "@/lib/api-registry";

// Track server start time for uptime calculation
const serverStartTime = Date.now();

interface HealthCheckResponse {
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

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const uptimeSeconds = (Date.now() - serverStartTime) / 1000;

  // Check database connection
  let dbStatus: HealthCheckResponse["services"]["database"] = {
    status: "disconnected",
  };

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    dbStatus = { status: "connected", latency };
  } catch (error) {
    dbStatus = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }

  // Get API counts by category
  const byCategory = getAPICounts();

  // Determine overall health status
  let status: HealthCheckResponse["status"] = "healthy";
  if (dbStatus.status === "error") {
    status = "unhealthy";
  } else if (dbStatus.status === "disconnected") {
    status = "degraded";
  }

  const response: HealthCheckResponse = {
    status,
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: dbStatus,
      redis: {
        status: process.env.REDIS_URL ? "connected" : "not_configured",
      },
    },
    apis: {
      total: API_ROUTES.length,
      byCategory,
    },
    serverLogs: {
      path: "/var/log/pm2/astralis-*.log",
      description: "PM2 application logs on production server",
    },
  };

  return NextResponse.json(response, {
    status: status === "healthy" ? 200 : status === "degraded" ? 200 : 503,
  });
}
