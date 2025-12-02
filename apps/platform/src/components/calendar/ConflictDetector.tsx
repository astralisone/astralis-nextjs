"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, Clock } from "lucide-react";

interface ConflictDetectorProps {
  conflicts: any[];
  severity?: "low" | "medium" | "high";
}

export function ConflictDetector({
  conflicts,
  severity = "medium",
}: ConflictDetectorProps) {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  // Determine severity based on number of conflicts if not provided
  const effectiveSeverity =
    conflicts.length >= 5
      ? "high"
      : conflicts.length >= 3
      ? "medium"
      : "low";

  const severityConfig = {
    low: {
      badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
      alert: "warning" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    medium: {
      badge: "bg-orange-100 text-orange-800 border-orange-300",
      alert: "warning" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    high: {
      badge: "bg-red-100 text-red-800 border-red-300",
      alert: "error" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  };

  const config = severityConfig[effectiveSeverity];

  // Extract unique participants affected
  const affectedParticipants = new Set<string>();
  conflicts.forEach((conflict) => {
    if (conflict.participants && Array.isArray(conflict.participants)) {
      conflict.participants.forEach((p: string) =>
        affectedParticipants.add(p)
      );
    }
  });

  return (
    <Alert variant={config.alert} className="space-y-3">
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-2">
            Scheduling Conflicts Detected
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
            >
              {effectiveSeverity.toUpperCase()}
            </span>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-3">
              {conflicts.length} conflicting{" "}
              {conflicts.length === 1 ? "event" : "events"} found during this
              time slot.
            </p>

            {/* Conflicting Events List */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Conflicting Events:</span>
              </div>
              <div className="space-y-1.5 ml-5">
                {conflicts.map((conflict, index) => (
                  <div
                    key={conflict.id || index}
                    className="bg-white/50 rounded-md p-2 text-sm"
                  >
                    <div className="font-medium text-astralis-navy">
                      {conflict.title}
                    </div>
                    <div className="text-slate-600 text-xs mt-0.5">
                      {new Date(conflict.startTime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}{" "}
                      -{" "}
                      {new Date(conflict.endTime).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    {conflict.location && (
                      <div className="text-slate-500 text-xs mt-0.5">
                        Location: {conflict.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Participants */}
            {affectedParticipants.size > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    Affected Participants ({affectedParticipants.size}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-5">
                  {Array.from(affectedParticipants).map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {effectiveSeverity === "high" && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-xs">
                <strong>Recommendation:</strong> Consider choosing a different
                time slot to avoid scheduling conflicts.
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
