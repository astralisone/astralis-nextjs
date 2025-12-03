"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startTime: Date | string;
    endTime: Date | string;
    location?: string;
    meetingLink?: string;
    participants?: string[];
    status?: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "CONFLICT";
    conflicts?: any[];
  };
  onClick?: () => void;
  onAccept?: (eventId: string) => Promise<void>;
  onDecline?: (eventId: string) => Promise<void>;
  isUpdating?: boolean;
}

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Scheduled",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    dotColor: "bg-blue-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    dotColor: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    dotColor: "bg-red-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    dotColor: "bg-slate-500",
  },
  CONFLICT: {
    label: "Conflict",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    dotColor: "bg-orange-500",
  },
};

export function EventCard({ event, onClick, onAccept, onDecline, isUpdating }: EventCardProps) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);

  const status = event.status || "SCHEDULED";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const hasConflicts = event.conflicts && event.conflicts.length > 0;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = () => {
    const today = new Date();
    return (
      startDate.getDate() === today.getDate() &&
      startDate.getMonth() === today.getMonth() &&
      startDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card
      className={`p-4 bg-slate-50 hover:shadow-card-hover transition-all cursor-pointer ${
        hasConflicts ? "border-l-4 border-l-red-500" : ""
      } ${onClick ? "hover:border-astralis-blue" : ""}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-astralis-navy text-base truncate">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                {event.description}
              </p>
            )}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          </div>
        </div>

        {/* Time and Date */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">
              {formatDate(startDate)}
              {isToday() && (
                <span className="ml-2 px-1.5 py-0.5 bg-astralis-blue text-white text-xs rounded font-medium">
                  Today
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">
              {formatTime(startDate)} - {formatTime(endDate)}
            </span>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 truncate">{event.location}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-5 w-5 text-slate-400" />
              <span className="text-xs text-slate-600">
                {event.participants.length} participant
                {event.participants.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center gap-2">
            {/* Meeting Link */}
            {event.meetingLink && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                <Video className="h-5 w-5" />
                <span className="hidden sm:inline">Video call</span>
              </div>
            )}

            {/* Conflict Badge */}
            {hasConflicts && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded text-xs text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {event.conflicts?.length ?? 0} conflict
                  {(event.conflicts?.length ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(onAccept || onDecline) && event.status === 'SCHEDULED' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
            {onAccept && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                onClick={(e) => { e.stopPropagation(); onAccept(event.id); }}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Accept
              </Button>
            )}
            {onDecline && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                onClick={(e) => { e.stopPropagation(); onDecline(event.id); }}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                Decline
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
