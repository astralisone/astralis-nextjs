/**
 * Dashboard Types
 * Type definitions for dashboard components and API responses
 */

import { IntakeStatus, IntakeSource } from "@prisma/client";

/**
 * Dashboard Statistics Response
 */
export interface DashboardStats {
  pipelines: {
    total: number;
    active: number;
    change: number; // Percentage change from last period
  };
  intake: {
    total: number;
    pending: number;
    change: number;
  };
  documents: {
    total: number;
    processing: number;
    change: number;
  };
  events: {
    total: number;
    upcoming: number;
    change: number;
  };
}

/**
 * Activity Types
 */
export type ActivityType =
  | "pipeline_created"
  | "intake_received"
  | "document_processed"
  | "event_scheduled"
  | "pipeline_completed"
  | "intake_assigned";

/**
 * Activity Feed Item
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Recent Pipeline Item
 */
export interface RecentPipeline {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  stageCount: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Metric Card Props
 */
export interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  subtitle: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
  href?: string;
}

/**
 * Recent Document Item
 */
export interface RecentDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processedAt: Date | null;
  createdAt: Date;
  url: string | null;
}

/**
 * Dashboard Data Response (combined)
 */
export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  recentPipelines: RecentPipeline[];
  recentDocuments: RecentDocument[];
  roiMetrics: {
    automationRate: number;      // Percentage (0-100)
    timeSavedHours: number;      // Total hours saved
    estimatedCost: number;       // Dollar amount (tokens)
    errorRate: number;           // Percentage of failed ops
    modelUsage: {                // Token breakdown
      input: number;
      output: number;
    };
  };
}


export interface ChartDataPoint {
  date: string; // ISO date string
  value: number;
}

/**
 * Intake Over Time Data
 */
export interface IntakeOverTimeData {
  source: IntakeSource;
  dataPoints: ChartDataPoint[];
}

/**
 * Intake Status Distribution Data
 */
export interface IntakeStatusDistribution {
  status: IntakeStatus;
  count: number;
}