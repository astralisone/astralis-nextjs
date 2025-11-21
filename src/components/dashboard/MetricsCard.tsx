"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * MetricsCard Component
 *
 * Displays a single metric with:
 * - Icon and title
 * - Primary value
 * - Trend indicator (up/down/neutral)
 * - Percentage change
 * - Optional subtitle
 * - Optional click to navigate
 */

export interface MetricsCardProps {
  title: string;
  value: number;
  change: number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  href?: string;
  variant?: "default" | "success" | "warning" | "info";
}

export function MetricsCard({
  title,
  value,
  change,
  subtitle,
  icon,
  trend = "neutral",
  href,
  variant = "default",
}: MetricsCardProps) {
  // Determine trend icon and color
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-error"
      : "text-slate-500";

  // Variant colors for icon background
  const variantColors = {
    default: "bg-astralis-blue/10 text-astralis-blue",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  const content = (
    <Card
      variant="default"
      hover={!!href}
      className={cn(
        "transition-all duration-200",
        href && "cursor-pointer hover:border-astralis-blue"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </h3>
        <div
          className={cn(
            "inline-flex items-center justify-center w-10 h-10 rounded-lg",
            variantColors[variant]
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Primary Value */}
          <div className="text-3xl font-bold text-astralis-navy dark:text-white">
            {value.toLocaleString()}
          </div>

          {/* Trend and Subtitle */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trendColor
              )}
            >
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Wrap in Link if href is provided
  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

/**
 * MetricsCardSkeleton
 * Loading state for MetricsCard
 */
export function MetricsCardSkeleton() {
  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
