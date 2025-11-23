"use client";

import * as React from "react";
import { Plus, Inbox, Upload, Calendar, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * QuickActions Component
 *
 * Panel of quick action buttons for common tasks:
 * - New Pipeline
 * - Submit Intake
 * - Upload Document
 * - Schedule Event
 *
 * Each action has an icon and label
 * Can open modals or navigate to forms
 */

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
}

interface QuickActionsProps {
  onNewPipeline?: () => void;
  onSubmitIntake?: () => void;
  onUploadDocument?: () => void;
  onScheduleEvent?: () => void;
}

export function QuickActions({
  onNewPipeline,
  onSubmitIntake,
  onUploadDocument,
  onScheduleEvent,
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "new-pipeline",
      label: "New Pipeline",
      icon: <Workflow className="w-5 h-5" />,
      href: onNewPipeline ? undefined : "/pipelines/new",
      onClick: onNewPipeline,
      variant: "primary",
    },
    {
      id: "submit-intake",
      label: "Submit Intake",
      icon: <Inbox className="w-5 h-5" />,
      href: onSubmitIntake ? undefined : "/intake/new",
      onClick: onSubmitIntake,
      variant: "secondary",
    },
    {
      id: "upload-document",
      label: "Upload Document",
      icon: <Upload className="w-5 h-5" />,
      href: onUploadDocument ? undefined : "/documents/upload",
      onClick: onUploadDocument,
      variant: "outline",
    },
    {
      id: "schedule-event",
      label: "Schedule Event",
      icon: <Calendar className="w-5 h-5" />,
      href: onScheduleEvent ? undefined : "/events/new",
      onClick: onScheduleEvent,
      variant: "outline",
    },
  ];

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-astralis-navy dark:text-white">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * QuickActionButton Component
 * Individual quick action button
 */
function QuickActionButton({ action }: { action: QuickAction }) {
  const buttonContent = (
    <Button
      variant={action.variant || "outline"}
      size="lg"
      className={cn(
        "w-full h-auto flex flex-col items-center justify-center gap-3 py-6",
        "hover:scale-105 transition-transform duration-150"
      )}
      onClick={action.onClick}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10">
        {action.icon}
      </div>
      <span className="text-sm font-semibold">{action.label}</span>
    </Button>
  );

  // If href is provided, wrap in Link
  if (action.href && !action.onClick) {
    return <Link href={action.href}>{buttonContent}</Link>;
  }

  return buttonContent;
}

/**
 * QuickActionsSkeleton
 * Loading state for QuickActions
 */
export function QuickActionsSkeleton() {
  return (
    <Card variant="default">
      <CardHeader>
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
