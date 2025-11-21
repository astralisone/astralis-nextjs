'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Settings,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Webhook,
  Calendar,
  Zap,
  Hand,
  Code,
} from 'lucide-react';
import type { Automation } from '@/types/automation';

interface AutomationCardProps {
  automation: Automation;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onExecute?: (id: string) => void;
}

const triggerIcons = {
  WEBHOOK: Webhook,
  SCHEDULE: Calendar,
  EVENT: Zap,
  MANUAL: Hand,
  API: Code,
};

export function AutomationCard({
  automation,
  onToggle,
  onDelete,
  onExecute,
}: AutomationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const successRate =
    automation.executionCount > 0
      ? Math.round((automation.successCount / automation.executionCount) * 100)
      : 0;

  const TriggerIcon = triggerIcons[automation.triggerType];

  const handleToggle = () => {
    if (onToggle) {
      onToggle(automation.id, !automation.isActive);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete && confirm(`Are you sure you want to delete "${automation.name}"?`)) {
      onDelete(automation.id);
    }
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExecute) {
      onExecute(automation.id);
    }
  };

  return (
    <Link href={`/automations/${automation.id}`}>
      <Card
        variant="default"
        hover
        className={cn(
          'cursor-pointer transition-all duration-200',
          isHovered && 'border-astralis-blue'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  automation.isActive
                    ? 'bg-astralis-blue/10 text-astralis-blue'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                <TriggerIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{automation.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={automation.isActive ? 'success' : 'default'}
                    className="text-xs"
                  >
                    {automation.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="default" className="text-xs capitalize">
                    {automation.triggerType.toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                title={automation.isActive ? 'Pause automation' : 'Activate automation'}
              >
                {automation.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {automation.description && (
            <CardDescription className="line-clamp-2">
              {automation.description}
            </CardDescription>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3" />
                <span>Executions</span>
              </div>
              <p className="text-lg font-semibold text-astralis-navy">
                {automation.executionCount}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>Success Rate</span>
              </div>
              <p className="text-lg font-semibold text-astralis-navy">
                {successRate}%
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>Avg Time</span>
              </div>
              <p className="text-lg font-semibold text-astralis-navy">
                {automation.avgExecutionTime
                  ? `${Math.round(automation.avgExecutionTime / 1000)}s`
                  : '-'}
              </p>
            </div>
          </div>

          {/* Tags */}
          {automation.tags && automation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {automation.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {automation.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{automation.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons (visible on hover) */}
          {isHovered && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecute}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/automations/${automation.id}/settings`;
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Last Execution */}
          {automation.lastExecutedAt && (
            <div className="text-xs text-slate-500 pt-2">
              Last executed{' '}
              {new Date(automation.lastExecutedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
