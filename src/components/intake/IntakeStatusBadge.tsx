import React from 'react';
import { IntakeStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Route,
  UserCheck,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface IntakeStatusBadgeProps {
  status: IntakeStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  NEW: {
    label: 'New',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  ROUTING: {
    label: 'Routing',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Route,
  },
  ASSIGNED: {
    label: 'Assigned',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: UserCheck,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Loader2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
} as const;

export function IntakeStatusBadge({
  status,
  showIcon = true,
  className
}: IntakeStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="default"
      className={`${config.color} ${className || ''}`}
    >
      {showIcon && <Icon className=" ui-icon w-5 h-5 mr-1.5" />}
      {config.label}
    </Badge>
  );
}
