"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X, Bell, Mail } from "lucide-react";

interface Reminder {
  id?: string;
  offsetMinutes: number;
  method: "email";
}

interface ReminderSettingsProps {
  reminders: Reminder[];
  onChange: (reminders: Reminder[]) => void;
}

const PRESET_OFFSETS = [
  { label: "5 minutes before", value: 5 },
  { label: "15 minutes before", value: 15 },
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "2 hours before", value: 120 },
  { label: "1 day before", value: 1440 },
  { label: "Custom", value: -1 },
];

export function ReminderSettings({
  reminders,
  onChange,
}: ReminderSettingsProps) {
  const [selectedOffset, setSelectedOffset] = useState<number>(15);
  const [customOffset, setCustomOffset] = useState<string>("");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">(
    "minutes"
  );

  const handleAddReminder = () => {
    let offsetMinutes = selectedOffset;

    // Handle custom offset
    if (selectedOffset === -1) {
      const customValue = parseInt(customOffset);
      if (isNaN(customValue) || customValue <= 0) {
        return; // Invalid custom value
      }

      switch (customUnit) {
        case "minutes":
          offsetMinutes = customValue;
          break;
        case "hours":
          offsetMinutes = customValue * 60;
          break;
        case "days":
          offsetMinutes = customValue * 1440;
          break;
      }
    }

    // Check if reminder already exists
    const exists = reminders.some((r) => r.offsetMinutes === offsetMinutes);
    if (exists) {
      return; // Don't add duplicate
    }

    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      offsetMinutes,
      method: "email",
    };

    onChange([...reminders, newReminder]);

    // Reset form
    setSelectedOffset(15);
    setCustomOffset("");
  };

  const handleRemoveReminder = (index: number) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    onChange(updatedReminders);
  };

  const formatReminderTime = (offsetMinutes: number): string => {
    if (offsetMinutes < 60) {
      return `${offsetMinutes} minute${offsetMinutes !== 1 ? "s" : ""} before`;
    } else if (offsetMinutes < 1440) {
      const hours = Math.floor(offsetMinutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""} before`;
    } else {
      const days = Math.floor(offsetMinutes / 1440);
      return `${days} day${days !== 1 ? "s" : ""} before`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-astralis-blue" />
        <h3 className="text-lg font-semibold text-astralis-navy">
          Event Reminders
        </h3>
      </div>

      {/* Add Reminder Form */}
      <Card className="p-4 space-y-4">
        <div className="space-y-3">
          <Label htmlFor="reminderOffset">Reminder Time</Label>

          {/* Preset Selector */}
          <select
            id="reminderOffset"
            value={selectedOffset}
            onChange={(e) => setSelectedOffset(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
          >
            {PRESET_OFFSETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>

          {/* Custom Input (shown when Custom is selected) */}
          {selectedOffset === -1 && (
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={customOffset}
                onChange={(e) => setCustomOffset(e.target.value)}
                placeholder="Enter value"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
              />
              <select
                value={customUnit}
                onChange={(e) =>
                  setCustomUnit(e.target.value as "minutes" | "hours" | "days")
                }
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          )}

          {/* Method Display (Email only for now) */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="h-4 w-4" />
            <span>Reminder method: Email notification</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddReminder}
          className="w-full gap-2"
          disabled={selectedOffset === -1 && !customOffset}
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </Card>

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="space-y-2">
          <Label>Active Reminders ({reminders.length})</Label>
          <div className="space-y-2">
            {reminders
              .sort((a, b) => a.offsetMinutes - b.offsetMinutes)
              .map((reminder, index) => (
                <Card
                  key={reminder.id || index}
                  className="p-3 flex items-center justify-between hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-astralis-blue/10 rounded-lg">
                      <Bell className="h-4 w-4 text-astralis-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-astralis-navy">
                        {formatReminderTime(reminder.offsetMinutes)}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="h-3 w-3" />
                        <span>Email notification</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReminder(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <Bell className="h-10 w-10 text-slate-300" />
            <p className="text-slate-600 font-medium">No reminders set</p>
            <p className="text-sm text-slate-500">
              Add reminders to receive email notifications before events
            </p>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How reminders work</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Email reminders are sent to all event participants</li>
              <li>
                • Multiple reminders can be set for the same event
              </li>
              <li>• Reminders are sent based on event start time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
