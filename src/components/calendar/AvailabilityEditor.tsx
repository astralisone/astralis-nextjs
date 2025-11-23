"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Clock, Save, Plus, X } from "lucide-react";

interface TimeRange {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  timeRanges: TimeRange[];
}

interface WeeklyAvailability {
  [key: string]: DayAvailability;
}

interface AvailabilityEditorProps {
  rules: any[];
  onSave: (rules: any[]) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
];

export function AvailabilityEditor({
  rules,
  onSave,
}: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(() => {
    const initial: WeeklyAvailability = {};
    DAYS_OF_WEEK.forEach((day) => {
      const existingRule = rules.find((r) => r.dayOfWeek === day);
      initial[day] = {
        enabled: existingRule?.isAvailable || false,
        timeRanges: existingRule?.timeRanges || [
          { start: "09:00", end: "17:00" },
        ],
      };
    });
    return initial;
  });

  const [timezone, setTimezone] = useState("America/New_York");
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled: !availability[day].enabled,
      },
    });
  };

  const updateTimeRange = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newRanges = [...availability[day].timeRanges];
    newRanges[index][field] = value;
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: newRanges,
      },
    });
  };

  const addTimeRange = (day: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: [
          ...availability[day].timeRanges,
          { start: "09:00", end: "17:00" },
        ],
      },
    });
  };

  const removeTimeRange = (day: string, index: number) => {
    if (availability[day].timeRanges.length === 1) return; // Keep at least one
    const newRanges = availability[day].timeRanges.filter(
      (_, i) => i !== index
    );
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        timeRanges: newRanges,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedRules = DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day,
        isAvailable: availability[day].enabled,
        timeRanges: availability[day].timeRanges,
        timezone,
      }));
      await onSave(formattedRules);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timezone Selector */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Weekly Grid */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <Card
            key={day}
            className={`p-4 transition-all ${
              availability[day].enabled
                ? "border-astralis-blue bg-blue-50/30"
                : "border-slate-200 bg-slate-50/30"
            }`}
          >
            <div className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`toggle-${day}`}
                    checked={availability[day].enabled}
                    onChange={() => toggleDay(day)}
                    className="w-5 h-5 text-astralis-blue rounded focus:ring-astralis-blue"
                  />
                  <Label
                    htmlFor={`toggle-${day}`}
                    className={`text-base font-semibold cursor-pointer ${
                      availability[day].enabled
                        ? "text-astralis-navy"
                        : "text-slate-400"
                    }`}
                  >
                    {day}
                  </Label>
                </div>
                {availability[day].enabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeRange(day)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="hidden sm:inline">Add Time</span>
                  </Button>
                )}
              </div>

              {/* Time Ranges */}
              {availability[day].enabled && (
                <div className="space-y-2 ml-8">
                  {availability[day].timeRanges.map((range, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-3 rounded-md border border-slate-200"
                    >
                      <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <Input
                        type="time"
                        value={range.start}
                        onChange={(e) =>
                          updateTimeRange(day, index, "start", e.target.value)
                        }
                        className="flex-1"
                      />
                      <span className="text-slate-400 flex-shrink-0">to</span>
                      <Input
                        type="time"
                        value={range.end}
                        onChange={(e) =>
                          updateTimeRange(day, index, "end", e.target.value)
                        }
                        className="flex-1"
                      />
                      {availability[day].timeRanges.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeRange(day, index)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Visual Block */}
                  <div className="h-2 bg-green-200 rounded-full relative overflow-hidden">
                    {availability[day].timeRanges.map((range, index) => {
                      // Calculate position and width based on time
                      const startMinutes =
                        parseInt(range.start.split(":")[0]) * 60 +
                        parseInt(range.start.split(":")[1]);
                      const endMinutes =
                        parseInt(range.end.split(":")[0]) * 60 +
                        parseInt(range.end.split(":")[1]);
                      const left = (startMinutes / 1440) * 100;
                      const width = ((endMinutes - startMinutes) / 1440) * 100;

                      return (
                        <div
                          key={index}
                          className="absolute h-full bg-green-500"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Availability"}
        </Button>
      </div>
    </div>
  );
}
