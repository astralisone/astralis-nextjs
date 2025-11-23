"use client";

import * as React from "react";
import { z } from "zod";
import { Clock, Mail, Phone, User, FileText, Video, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { AvailabilityRule } from "./AvailabilityDisplay";

/**
 * PublicBookingForm Component
 *
 * Form for booking appointments with validation using Zod.
 * Displays available time slots based on selected date and availability rules.
 *
 * @example
 * ```tsx
 * <PublicBookingForm
 *   userId="user-123"
 *   selectedDate={selectedDate}
 *   availabilityRules={rules}
 *   onBookingComplete={handleBookingComplete}
 * />
 * ```
 */

// Zod schema for client-side validation
const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  description: z.string().optional(),
  timeSlot: z.string().min(1, "Please select a time slot"),
  meetingType: z.enum(["VIDEO_CALL", "PHONE_CALL", "IN_PERSON"], {
    required_error: "Please select a meeting type",
  }),
  timezone: z.string().min(1, "Please select a timezone"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

type FormErrors = Partial<Record<keyof BookingFormData, string>>;

export interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export interface PublicBookingFormProps {
  /** User ID for the booking target */
  userId: string;
  /** Currently selected date */
  selectedDate: Date | null;
  /** Availability rules for generating time slots */
  availabilityRules: AvailabilityRule[];
  /** Callback when booking is successfully completed */
  onBookingComplete?: (bookingId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

const MEETING_TYPES = [
  { value: "VIDEO_CALL", label: "Video Call", icon: Video },
  { value: "PHONE_CALL", label: "Phone Call", icon: Phone },
  { value: "IN_PERSON", label: "In Person", icon: MapPin },
] as const;

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "America/Anchorage", label: "Alaska (AK)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HI)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

const DAYS_OF_WEEK = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function getDayOfWeekFromDate(date: Date): (typeof DAYS_OF_WEEK)[number] {
  return DAYS_OF_WEEK[date.getDay()];
}

function generateTimeSlots(
  date: Date,
  availabilityRules: AvailabilityRule[],
  slotDuration: number = 30
): TimeSlot[] {
  const dayOfWeek = getDayOfWeekFromDate(date);
  const rulesForDay = availabilityRules.filter(
    (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive
  );

  if (rulesForDay.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  rulesForDay.forEach((rule) => {
    const [startHour, startMinute] = rule.startTime.split(":").map(Number);
    const [endHour, endMinute] = rule.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let mins = startMinutes; mins < endMinutes; mins += slotDuration) {
      const hour = Math.floor(mins / 60);
      const minute = mins % 60;
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const label = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;

      // Check if slot is in the past for today
      const now = new Date();
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);

      const isAvailable =
        slotDate.toDateString() !== now.toDateString() || slotDate > now;

      slots.push({ time, label, available: isAvailable });
    }
  });

  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PublicBookingForm({
  userId,
  selectedDate,
  availabilityRules,
  onBookingComplete,
  className,
}: PublicBookingFormProps) {
  const [formData, setFormData] = React.useState<Partial<BookingFormData>>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<{
    type: "success" | "error";
    message: string;
    bookingId?: string;
  } | null>(null);

  // Generate time slots based on selected date
  const timeSlots = React.useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate, availabilityRules);
  }, [selectedDate, availabilityRules]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof BookingFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!selectedDate) {
      setSubmitStatus({
        type: "error",
        message: "Please select a date from the calendar",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: selectedDate.toISOString().split("T")[0],
          time: formData.timeSlot,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          description: formData.description || "",
          meetingType: formData.meetingType,
          timezone: formData.timezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setSubmitStatus({
        type: "success",
        message: data.message || "Your booking has been confirmed!",
        bookingId: data.bookingId,
      });

      // Reset form
      setFormData({
        timezone: formData.timezone,
      });

      if (onBookingComplete && data.bookingId) {
        onBookingComplete(data.bookingId);
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDate) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <Clock className="mx-auto h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">
              Select a date to view available times
            </p>
            <p className="text-sm mt-1">
              Choose a date from the calendar to see available time slots
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl">Book Your Appointment</CardTitle>
        <CardDescription>
          Selected date: {formatSelectedDate(selectedDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus && (
          <Alert
            variant={submitStatus.type === "success" ? "success" : "error"}
            showIcon
            className="mb-6"
          >
            <AlertTitle>
              {submitStatus.type === "success" ? "Booking Confirmed!" : "Booking Failed"}
            </AlertTitle>
            <AlertDescription>
              {submitStatus.message}
              {submitStatus.bookingId && (
                <p className="mt-1 font-mono text-sm">
                  Booking ID: {submitStatus.bookingId}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name || ""}
                onChange={handleInputChange}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Appointment Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="timeSlot">
                Time Slot <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.timeSlot || ""}
                onValueChange={(value) => handleSelectChange("timeSlot", value)}
              >
                <SelectTrigger
                  id="timeSlot"
                  aria-invalid={!!errors.timeSlot}
                  aria-describedby={errors.timeSlot ? "timeSlot-error" : undefined}
                >
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length === 0 ? (
                    <SelectItem value="no-slots" disabled>
                      No available times for this date
                    </SelectItem>
                  ) : (
                    timeSlots.map((slot) => (
                      <SelectItem
                        key={slot.time}
                        value={slot.time}
                        disabled={!slot.available}
                      >
                        {slot.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.timeSlot && (
                <p id="timeSlot-error" className="text-sm text-red-500">
                  {errors.timeSlot}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingType">
                Meeting Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.meetingType || ""}
                onValueChange={(value) => handleSelectChange("meetingType", value)}
              >
                <SelectTrigger
                  id="meetingType"
                  aria-invalid={!!errors.meetingType}
                  aria-describedby={errors.meetingType ? "meetingType-error" : undefined}
                >
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.meetingType && (
                <p id="meetingType-error" className="text-sm text-red-500">
                  {errors.meetingType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">
                Your Timezone <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.timezone || ""}
                onValueChange={(value) => handleSelectChange("timezone", value)}
              >
                <SelectTrigger
                  id="timezone"
                  aria-invalid={!!errors.timezone}
                  aria-describedby={errors.timezone ? "timezone-error" : undefined}
                >
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p id="timezone-error" className="text-sm text-red-500">
                  {errors.timezone}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description (optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What would you like to discuss?"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting || timeSlots.length === 0}
          >
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
