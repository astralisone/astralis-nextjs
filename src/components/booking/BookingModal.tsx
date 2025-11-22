'use client';

import * as React from 'react';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@prisma/client';

/**
 * Booking Modal Component
 *
 * A comprehensive booking interface for scheduling consultation calls.
 *
 * Features:
 * - Multi-step form (3 steps: Info -> Schedule -> Confirmation)
 * - Meeting type selection (Video, Phone, In-Person)
 * - Date and time selection with availability checking
 * - Fetches availability rules and existing bookings
 * - Filters/disables time slots that conflict with existing bookings
 * - Form validation
 * - Email notification on submission
 * - Accessible dialog with focus management
 * - Keyboard navigation (ESC to close)
 *
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback when the modal is closed
 * @param userId - Optional user ID to fetch availability for (defaults to system-wide availability)
 * @param availabilityRules - Optional pre-loaded availability rules (will be fetched if not provided)
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <BookingModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   userId="user-123"
 * />
 * ```
 */

/**
 * Availability rule structure
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

/**
 * Time slot structure
 */
export interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

/**
 * Existing event structure for conflict checking
 */
interface ExistingEvent {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * BookingModal Props
 *
 * @param isOpen - Controls the visibility of the booking modal
 * @param onClose - Callback invoked when the modal should close
 * @param userId - Optional user ID to fetch availability for
 * @param availabilityRules - Optional pre-loaded availability rules
 */
export interface BookingModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback fired when the modal is closed */
  onClose: () => void;
  /** Optional user ID to fetch availability for */
  userId?: string;
  /** Optional pre-loaded availability rules */
  availabilityRules?: AvailabilityRule[];
}

/**
 * Meeting type options
 */
type MeetingType = 'VIDEO_CALL' | 'PHONE_CALL' | 'IN_PERSON';

/**
 * Booking form data structure
 */
interface BookingFormData {
  /** Step 1: Personal Information */
  name: string;
  email: string;
  phone: string;
  company: string;

  /** Step 2: Scheduling */
  date: string;
  time: string;
  meetingType: MeetingType;

  /** Step 3: Details */
  message: string;
}

const MEETING_TYPES = [
  { value: 'VIDEO_CALL' as MeetingType, label: 'Video Call', icon: Video, description: 'Google Meet or Zoom' },
  { value: 'PHONE_CALL' as MeetingType, label: 'Phone Call', icon: Phone, description: 'We\'ll call you' },
  { value: 'IN_PERSON' as MeetingType, label: 'In Person', icon: MapPin, description: 'Meet at location' },
];

/**
 * Default time slots (fallback when no availability rules are provided)
 */
const DEFAULT_TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];

const DAYS_OF_WEEK: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

/**
 * Get day of week enum from Date object
 */
function getDayOfWeekFromDate(date: Date): DayOfWeek {
  return DAYS_OF_WEEK[date.getDay()];
}

/**
 * Generate time slots based on availability rules for a specific date
 */
function generateTimeSlots(
  date: Date,
  availabilityRules: AvailabilityRule[],
  existingEvents: ExistingEvent[],
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
  const now = new Date();

  rulesForDay.forEach((rule) => {
    const [startHour, startMinute] = rule.startTime.split(':').map(Number);
    const [endHour, endMinute] = rule.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let mins = startMinutes; mins < endMinutes; mins += slotDuration) {
      const hour = Math.floor(mins / 60);
      const minute = mins % 60;
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const label = `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;

      // Create slot datetime for comparison
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);

      // Check if slot is in the past for today
      const isPast = slotDate.toDateString() === now.toDateString() && slotDate <= now;

      // Check if slot conflicts with existing events
      const slotEndDate = new Date(slotDate);
      slotEndDate.setMinutes(slotEndDate.getMinutes() + slotDuration);

      const hasConflict = existingEvents.some((event) => {
        // Only check scheduled/confirmed events
        if (!['SCHEDULED', 'CONFIRMED'].includes(event.status)) {
          return false;
        }
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        // Check for overlap: slot starts before event ends AND slot ends after event starts
        return slotDate < eventEnd && slotEndDate > eventStart;
      });

      const isAvailable = !isPast && !hasConflict;

      slots.push({ time: label, label, available: isAvailable });
    }
  });

  return slots.sort((a, b) => {
    // Convert label to 24h for sorting
    const parseTime = (label: string) => {
      const [time, ampm] = label.split(' ');
      const [h, m] = time.split(':').map(Number);
      const hour24 = ampm === 'PM' && h !== 12 ? h + 12 : (ampm === 'AM' && h === 12 ? 0 : h);
      return hour24 * 60 + m;
    };
    return parseTime(a.label) - parseTime(b.label);
  });
}

/**
 * Convert default time slots to TimeSlot format with availability based on existing events
 */
function convertDefaultSlotsToTimeSlots(
  date: Date,
  existingEvents: ExistingEvent[],
  slotDuration: number = 30
): TimeSlot[] {
  const now = new Date();

  return DEFAULT_TIME_SLOTS.map((label) => {
    // Parse the time label (e.g., "09:00 AM")
    const [time, ampm] = label.split(' ');
    const [h, m] = time.split(':').map(Number);
    const hour24 = ampm === 'PM' && h !== 12 ? h + 12 : (ampm === 'AM' && h === 12 ? 0 : h);

    // Create slot datetime
    const slotDate = new Date(date);
    slotDate.setHours(hour24, m, 0, 0);

    // Check if slot is in the past for today
    const isPast = slotDate.toDateString() === now.toDateString() && slotDate <= now;

    // Check if slot conflicts with existing events
    const slotEndDate = new Date(slotDate);
    slotEndDate.setMinutes(slotEndDate.getMinutes() + slotDuration);

    const hasConflict = existingEvents.some((event) => {
      if (!['SCHEDULED', 'CONFIRMED'].includes(event.status)) {
        return false;
      }
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return slotDate < eventEnd && slotEndDate > eventStart;
    });

    return {
      time: label,
      label,
      available: !isPast && !hasConflict,
    };
  });
}

export function BookingModal({ isOpen, onClose, userId, availabilityRules: propAvailabilityRules }: BookingModalProps) {
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  // Availability and events state
  const [availabilityRules, setAvailabilityRules] = React.useState<AvailabilityRule[]>(propAvailabilityRules || []);
  const [existingEvents, setExistingEvents] = React.useState<ExistingEvent[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(false);
  const [availabilityError, setAvailabilityError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    date: '',
    time: '',
    meetingType: 'VIDEO_CALL',
    message: '',
  });

  // Get user's timezone for display
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Fetch availability rules when modal opens (if not provided via props)
  React.useEffect(() => {
    async function fetchAvailability() {
      if (!isOpen || propAvailabilityRules || !userId) return;

      setIsLoadingAvailability(true);
      setAvailabilityError(null);

      try {
        const response = await fetch(`/api/booking/availability?userId=${userId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch availability');
        }
        const data = await response.json();
        setAvailabilityRules(data.data || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setAvailabilityError(err instanceof Error ? err.message : 'Failed to load availability');
        // Continue with default slots if availability fetch fails
        setAvailabilityRules([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    }

    fetchAvailability();
  }, [isOpen, userId, propAvailabilityRules]);

  // Fetch existing events when date is selected
  React.useEffect(() => {
    async function fetchEventsForDate() {
      if (!formData.date || !userId) {
        setExistingEvents([]);
        return;
      }

      setIsLoadingEvents(true);

      try {
        const selectedDate = new Date(formData.date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/booking/events?userId=${userId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch events');
        }

        const data = await response.json();
        setExistingEvents(data.data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        // Continue without events if fetch fails
        setExistingEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEventsForDate();
  }, [formData.date, userId]);

  // Generate time slots based on availability rules and existing events
  const timeSlots = React.useMemo(() => {
    if (!formData.date) return [];

    const selectedDate = new Date(formData.date);

    // If we have availability rules, use them
    if (availabilityRules.length > 0) {
      return generateTimeSlots(selectedDate, availabilityRules, existingEvents);
    }

    // Otherwise, use default slots with conflict checking
    return convertDefaultSlotsToTimeSlots(selectedDate, existingEvents);
  }, [formData.date, availabilityRules, existingEvents]);

  // Clear time selection when date changes (since available slots may differ)
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, time: '' }));
  }, [formData.date]);

  const updateFormData = (field: keyof BookingFormData, value: string | MeetingType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your name');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid email');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Please enter your phone number');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.date) {
        setError('Please select a date');
        return false;
      }
      if (!formData.time) {
        setError('Please select a time');
        return false;
      }
      // Verify the selected time is still available
      const selectedSlot = timeSlots.find(slot => slot.time === formData.time);
      if (selectedSlot && !selectedSlot.available) {
        setError('The selected time is no longer available. Please choose another time.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    setError('');
    setAvailabilityError(null);
    setExistingEvents([]);
    // Only reset availability rules if they weren't provided via props
    if (!propAvailabilityRules) {
      setAvailabilityRules([]);
    }
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      date: '',
      time: '',
      meetingType: 'VIDEO_CALL',
      message: '',
    });
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isSuccess ? 'Booking Confirmed!' : 'Schedule a Call'}
          </DialogTitle>
          {!isSuccess && (
            <DialogDescription>
              Step {step} of 3
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Progress Bar */}
        {!isSuccess && (
          <div className="pt-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    i <= step ? 'bg-astralis-blue' : 'bg-slate-200'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="py-4">
          {isSuccess ? (
            // Success State
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-astralis-navy mb-2">
                Your call has been scheduled!
              </h3>
              <p className="text-slate-600 mb-6">
                We've sent a confirmation email to <strong>{formData.email}</strong> with all the details.
              </p>
              <div className="bg-slate-50 rounded-lg p-6 text-left mb-6">
                <h4 className="font-semibold text-astralis-navy mb-4">Meeting Details:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-700">Date & Time</p>
                      <p className="text-slate-600">{formData.date} at {formData.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {MEETING_TYPES.find(t => t.value === formData.meetingType)?.icon && (
                      React.createElement(
                        MEETING_TYPES.find(t => t.value === formData.meetingType)!.icon,
                        { className: "w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" }
                      )
                    )}
                    <div>
                      <p className="font-medium text-slate-700">Meeting Type</p>
                      <p className="text-slate-600">
                        {MEETING_TYPES.find(t => t.value === formData.meetingType)?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleClose}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </div>
          ) : (
            // Form Steps
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-astralis-navy mb-2">
                      Tell us about yourself
                    </h3>
                    <p className="text-sm text-slate-600">
                      We'll use this information to prepare for our call.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="John Smith"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="john@company.com"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => updateFormData('company', e.target.value)}
                        placeholder="Acme Corp"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-astralis-navy mb-2">
                      Choose your preferred time
                    </h3>
                    <p className="text-sm text-slate-600">
                      Select a date and time that works best for you.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your timezone: {getUserTimezone()}
                    </p>
                  </div>

                  {isLoadingAvailability && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading availability...</span>
                    </div>
                  )}

                  {availabilityError && (
                    <Alert variant="warning" showIcon>
                      <AlertDescription>
                        Could not load availability rules. Using default time slots.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => updateFormData('date', e.target.value)}
                          min={getMinDate()}
                          max={getMaxDate()}
                          className="bg-white pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        {isLoadingEvents ? (
                          <div className="w-full h-10 pl-10 pr-4 bg-white border border-slate-300 rounded-md flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="ml-2 text-sm text-slate-500">Loading available times...</span>
                          </div>
                        ) : (
                          <select
                            id="time"
                            value={formData.time}
                            onChange={(e) => updateFormData('time', e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
                            disabled={!formData.date || timeSlots.length === 0}
                          >
                            {!formData.date ? (
                              <option value="">Select a date first</option>
                            ) : timeSlots.length === 0 ? (
                              <option value="">No available times for this date</option>
                            ) : (
                              <>
                                <option value="">Select a time</option>
                                {timeSlots.map((slot) => (
                                  <option
                                    key={slot.time}
                                    value={slot.time}
                                    disabled={!slot.available}
                                  >
                                    {slot.label}{!slot.available ? ' (Unavailable)' : ''}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        )}
                      </div>
                      {formData.date && timeSlots.length > 0 && (
                        <p className="text-xs text-slate-500">
                          {timeSlots.filter(s => s.available).length} time slots available
                        </p>
                      )}
                      {formData.date && availabilityRules.length > 0 && timeSlots.length === 0 && (
                        <p className="text-xs text-amber-600">
                          No availability on this day. Please select a different date.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Meeting Type *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {MEETING_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => updateFormData('meetingType', type.value)}
                              className={cn(
                                'p-4 border-2 rounded-lg text-left transition-all',
                                formData.meetingType === type.value
                                  ? 'border-astralis-blue bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              )}
                            >
                              <Icon className={cn(
                                'w-6 h-6 mb-2',
                                formData.meetingType === type.value ? 'text-astralis-blue' : 'text-slate-400'
                              )} />
                              <p className="font-medium text-sm text-astralis-navy">
                                {type.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {type.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-astralis-navy mb-2">
                      Additional details
                    </h3>
                    <p className="text-sm text-slate-600">
                      Let us know what you'd like to discuss (optional).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">What would you like to discuss?</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      placeholder="Tell us about your project, goals, or any questions you have..."
                      rows={6}
                      className="bg-white"
                    />
                  </div>

                  {/* Review Summary */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-astralis-navy">Review Details:</h4>
                    <div className="text-sm space-y-2 text-slate-600">
                      <p><strong>Name:</strong> {formData.name}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      {formData.company && <p><strong>Company:</strong> {formData.company}</p>}
                      <p><strong>Date:</strong> {formData.date}</p>
                      <p><strong>Time:</strong> {formData.time}</p>
                      <p><strong>Meeting Type:</strong> {MEETING_TYPES.find(t => t.value === formData.meetingType)?.label}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="error" showIcon className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
