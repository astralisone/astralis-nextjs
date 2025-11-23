"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Workflow,
  Inbox,
  FileCheck,
  Calendar,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem, ActivityType } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * ActivityFeed Component
 *
 * Displays recent activity across the platform
 * - Shows last 20 activities
 * - Activity types: pipeline, intake, document, event
 * - Relative timestamps
 * - User avatars and names
 * - "View all" link
 */

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 20 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-astralis-navy dark:text-white">
          Recent Activity
        </CardTitle>
        <Link
          href="/activity"
          className="text-sm font-medium text-astralis-blue hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ActivityFeedItem Component
 * Individual activity item with icon, description, and timestamp
 */
function ActivityFeedItem({ activity }: { activity: ActivityItem }) {
  const icon = getActivityIcon(activity.type);
  const iconColor = getActivityIconColor(activity.type);

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg",
          iconColor
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-astralis-navy dark:text-white">
              {activity.title}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activity.description}
            </p>
          </div>
        </div>

        {/* Footer: User and Timestamp */}
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {activity.user && (
            <>
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name || "User"}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-astralis-blue/20 flex items-center justify-center text-astralis-blue text-xs font-semibold">
                  {activity.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="font-medium">{activity.user.name}</span>
              <span>•</span>
            </>
          )}
          <span>
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type: ActivityType): React.ReactNode {
  const iconProps = { className: "w-5 h-5" };

  switch (type) {
    case "pipeline_created":
      return <Workflow {...iconProps} />;
    case "pipeline_completed":
      return <CheckCircle {...iconProps} />;
    case "intake_received":
      return <Inbox {...iconProps} />;
    case "intake_assigned":
      return <UserPlus {...iconProps} />;
    case "document_processed":
      return <FileCheck {...iconProps} />;
    case "event_scheduled":
      return <Calendar {...iconProps} />;
    default:
      return <Workflow {...iconProps} />;
  }
}

/**
 * Get icon background color for activity type
 */
function getActivityIconColor(type: ActivityType): string {
  switch (type) {
    case "pipeline_created":
      return "bg-astralis-blue/10 text-astralis-blue";
    case "pipeline_completed":
      return "bg-success/10 text-success";
    case "intake_received":
      return "bg-info/10 text-info";
    case "intake_assigned":
      return "bg-warning/10 text-warning";
    case "document_processed":
      return "bg-success/10 text-success";
    case "event_scheduled":
      return "bg-info/10 text-info";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
  }
}

/**
 * ActivityFeedSkeleton
 * Loading state for ActivityFeed
 */
export function ActivityFeedSkeleton() {
  return (
    <Card variant="default">
      <CardHeader>
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
