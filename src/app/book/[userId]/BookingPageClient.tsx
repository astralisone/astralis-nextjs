"use client";

import * as React from "react";
import {
  AvailabilityDisplay,
  PublicBookingForm,
  type AvailabilityRule,
} from "@/components/scheduling";

/**
 * BookingPageClient Component
 *
 * Client-side component that handles the interactive booking experience.
 * Manages date selection state between the calendar and booking form.
 */

export interface BookingPageClientProps {
  /** User ID for the booking target */
  userId: string;
  /** User name for display */
  userName: string;
  /** Availability rules for the calendar */
  availabilityRules: AvailabilityRule[];
  /** Default timezone to use */
  defaultTimezone: string;
}

export function BookingPageClient({
  userId,
  userName,
  availabilityRules,
  defaultTimezone,
}: BookingPageClientProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [bookingComplete, setBookingComplete] = React.useState(false);
  const [bookingId, setBookingId] = React.useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Reset booking state when date changes
    if (bookingComplete) {
      setBookingComplete(false);
      setBookingId(null);
    }
  };

  const handleBookingComplete = (newBookingId: string) => {
    setBookingComplete(true);
    setBookingId(newBookingId);
    setSelectedDate(null);
  };

  if (bookingComplete && bookingId) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="max-w-md mx-auto px-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-600 mb-4">
            Your meeting with {userName} has been scheduled successfully.
          </p>
          <p className="text-sm text-slate-500 font-mono bg-slate-100 rounded px-3 py-2 inline-block">
            Booking ID: {bookingId}
          </p>
          <p className="mt-6 text-sm text-slate-600">
            A confirmation email has been sent to you with all the details.
          </p>

          {/* Book Another Button */}
          <button
            onClick={() => {
              setBookingComplete(false);
              setBookingId(null);
            }}
            className="mt-8 inline-flex items-center px-4 py-2 border border-astralis-blue text-sm font-medium rounded-md text-astralis-blue bg-white hover:bg-astralis-blue/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-astralis-blue transition-colors"
          >
            Book Another Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Calendar Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Select a Date
        </h2>
        <AvailabilityDisplay
          userId={userId}
          availabilityRules={availabilityRules}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          timezone={defaultTimezone}
        />

        {/* Availability Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Availability
          </h3>
          <p className="text-sm text-blue-700">
            {userName} is typically available during the highlighted dates.
            Select a date to see available time slots.
          </p>
        </div>
      </div>

      {/* Booking Form Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Book Your Appointment
        </h2>
        <PublicBookingForm
          userId={userId}
          selectedDate={selectedDate}
          availabilityRules={availabilityRules}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </div>
  );
}
