"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Users, Clock } from "lucide-react";

interface TimeSlot {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  confidence: number;
  reasoning?: string;
  hasConflicts?: boolean;
  availableParticipants?: string[];
}

interface TimeSlotSuggestionsProps {
  suggestions: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotSuggestions({
  suggestions,
  onSelect,
}: TimeSlotSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <Sparkles className="h-12 w-12 text-slate-300" />
          <p className="text-slate-600">No time slot suggestions available</p>
          <p className="text-sm text-slate-500">
            Add participants to get AI-powered time suggestions
          </p>
        </div>
      </Card>
    );
  }

  const topSuggestions = suggestions.slice(0, 5);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-astralis-blue" />
        <h3 className="text-lg font-semibold text-astralis-navy">
          AI-Powered Time Suggestions
        </h3>
      </div>

      <div className="space-y-3">
        {topSuggestions.map((slot, index) => {
          const isConflictFree = !slot.hasConflicts;
          const startDate = new Date(slot.startTime);
          const endDate = new Date(slot.endTime);

          return (
            <Card
              key={slot.id || index}
              className="overflow-hidden hover:shadow-card-hover transition-all cursor-pointer border-2 hover:border-astralis-blue"
              onClick={() => onSelect(slot)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section: Time Info */}
                  <div className="flex-1 space-y-2">
                    {/* Rank Badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-astralis-blue text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </span>
                      {isConflictFree && (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Conflict-free</span>
                        </div>
                      )}
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-base font-semibold text-astralis-navy">
                          {formatDate(startDate)}
                        </span>
                      </div>
                      <div className="ml-6 text-sm text-slate-600">
                        {formatTime(startDate)} - {formatTime(endDate)}
                      </div>
                    </div>

                    {/* Reasoning */}
                    {slot.reasoning && (
                      <div className="ml-6 text-sm text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-medium text-slate-700">
                          Why this time:
                        </span>{" "}
                        {slot.reasoning}
                      </div>
                    )}

                    {/* Available Participants */}
                    {slot.availableParticipants &&
                      slot.availableParticipants.length > 0 && (
                        <div className="ml-6 flex items-center gap-2 text-xs text-slate-600">
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            {slot.availableParticipants.length} participant
                            {slot.availableParticipants.length !== 1
                              ? "s"
                              : ""}{" "}
                            available
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Right Section: Confidence Score */}
                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getConfidenceColor(
                        slot.confidence
                      )}`}
                    >
                      {slot.confidence}% {getConfidenceLabel(slot.confidence)}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(slot);
                      }}
                      className="whitespace-nowrap"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>High Confidence (80%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Medium (60-79%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Low (Below 60%)</span>
        </div>
      </div>
    </div>
  );
}
