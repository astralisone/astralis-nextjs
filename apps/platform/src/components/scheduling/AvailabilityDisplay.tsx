"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayOfWeek } from "@prisma/client";

/**
 * AvailabilityDisplay Component
 *
 * Displays a calendar showing available time slots based on user availability rules.
 * Allows users to select a date and view available time slots for booking.
 *
 * @example
 * ```tsx
 * <AvailabilityDisplay
 *   userId="user-123"
 *   availabilityRules={rules}
 *   selectedDate={selectedDate}
 *   onDateSelect={setSelectedDate}
 *   timezone="America/New_York"
 * />
 * ```
 */

export interface AvailabilityRule {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailabilityDisplayProps {
  /** User ID for the booking target */
  userId: string;
  /** Availability rules defining when the user is available */
  availabilityRules: AvailabilityRule[];
  /** Currently selected date */
  selectedDate: Date | null;
  /** Callback when a date is selected */
  onDateSelect: (date: Date) => void;
  /** Timezone for displaying availability */
  timezone?: string;
  /** Optional CSS class name */
  className?: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const DAY_ABBREVIATIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayOfWeekFromDate(date: Date): DayOfWeek {
  return DAYS_OF_WEEK[date.getDay()];
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export function AvailabilityDisplay({
  userId,
  availabilityRules,
  selectedDate,
  onDateSelect,
  timezone = "UTC",
  className,
}: AvailabilityDisplayProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const calendarDays = React.useMemo(
    () => getCalendarDays(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  const availableDaysOfWeek = React.useMemo(() => {
    const activeDays = new Set<DayOfWeek>();
    availabilityRules
      .filter((rule) => rule.isActive)
      .forEach((rule) => activeDays.add(rule.dayOfWeek));
    return activeDays;
  }, [availabilityRules]);

  const isDateAvailable = React.useCallback(
    (date: Date): boolean => {
      if (isPastDate(date)) return false;
      const dayOfWeek = getDayOfWeekFromDate(date);
      return availableDaysOfWeek.has(dayOfWeek);
    },
    [availableDaysOfWeek]
  );

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect(date);
    }
  };

  // Prevent navigating to past months
  const canGoToPreviousMonth = React.useMemo(() => {
    const now = new Date();
    return (
      currentMonth.year > now.getFullYear() ||
      (currentMonth.year === now.getFullYear() &&
        currentMonth.month > now.getMonth())
    );
  }, [currentMonth]);

  return (
    <Card className={cn("w-full", className)} data-user-id={userId}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            disabled={!canGoToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg font-semibold">
            {formatMonthYear(
              new Date(currentMonth.year, currentMonth.month, 1)
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-slate-500 text-center">
          Timezone: {timezone}
        </p>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_ABBREVIATIONS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-10" />;
            }

            const available = isDateAvailable(date);
            const selected = selectedDate && isSameDay(date, selectedDate);
            const today = isToday(date);
            const past = isPastDate(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={!available}
                className={cn(
                  "h-10 w-full rounded-md text-sm font-medium transition-all duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:ring-offset-1",
                  {
                    // Available and selectable
                    "bg-white text-slate-900 hover:bg-astralis-blue/10 hover:text-astralis-blue cursor-pointer":
                      available && !selected,
                    // Selected state
                    "bg-astralis-blue text-white": selected,
                    // Unavailable/past dates
                    "text-slate-300 cursor-not-allowed": !available,
                    // Today indicator
                    "ring-1 ring-astralis-blue": today && !selected,
                  }
                )}
                aria-label={`${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${available ? ", available" : ", unavailable"}`}
                aria-pressed={selected || false}
                aria-disabled={!available}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-astralis-blue" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-white border border-slate-300" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-slate-100" />
            <span>Unavailable</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
