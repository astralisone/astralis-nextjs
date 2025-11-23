import { createEvent, DateArray, EventAttributes } from 'ics';

/**
 * Calendar Utility Functions
 *
 * Generates ICS calendar files for booking events that can be attached to emails
 * and imported into any calendar application (Google Calendar, Outlook, Apple Calendar, etc.)
 */

interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  duration: number; // in minutes
  attendeeEmail: string;
  attendeeName: string;
  organizerEmail: string;
  organizerName: string;
}

/**
 * Convert Date to ICS DateArray format [year, month, day, hour, minute]
 */
function dateToArray(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // ICS months are 1-indexed
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

/**
 * Parse time string (e.g., "02:30 PM") to hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }

  return { hours: hour24, minutes };
}

/**
 * Create combined Date object from date string and time string
 */
function createDateTime(dateStr: string, timeStr: string): Date {
  const date = new Date(dateStr);
  const { hours, minutes } = parseTime(timeStr);

  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Generate ICS calendar file content for a booking
 */
export async function generateBookingCalendarEvent(
  data: CalendarEventData
): Promise<string> {
  const event: EventAttributes = {
    start: dateToArray(data.startDate),
    duration: { minutes: data.duration },
    title: data.title,
    description: data.description,
    location: data.location,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: data.organizerName,
      email: data.organizerEmail,
    },
    attendees: [
      {
        name: data.attendeeName,
        email: data.attendeeEmail,
        rsvp: true,
        partstat: 'NEEDS-ACTION',
        role: 'REQ-PARTICIPANT',
      },
    ],
    method: 'REQUEST',
  };

  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Generate calendar event for a consultation booking
 */
export async function generateConsultationCalendarEvent(booking: {
  name: string;
  email: string;
  company?: string;
  date: string;
  time: string;
  meetingType: string;
  message?: string;
}): Promise<string> {
  const startDate = createDateTime(booking.date, booking.time);

  // Determine location based on meeting type
  let location = '';
  if (booking.meetingType === 'VIDEO_CALL') {
    location = 'Video Call (link will be sent separately)';
  } else if (booking.meetingType === 'PHONE_CALL') {
    location = 'Phone Call';
  } else if (booking.meetingType === 'IN_PERSON') {
    location = 'To be determined';
  }

  // Build description
  let description = `Consultation call with ${booking.name}`;
  if (booking.company) {
    description += ` from ${booking.company}`;
  }
  if (booking.message) {
    description += `\n\nDiscussion topics:\n${booking.message}`;
  }
  description += `\n\nContact: ${booking.email}`;

  return generateBookingCalendarEvent({
    title: `Consultation: ${booking.name}${booking.company ? ` (${booking.company})` : ''}`,
    description,
    location,
    startDate,
    duration: 30, // 30-minute consultation
    attendeeEmail: booking.email,
    attendeeName: booking.name,
    organizerEmail: 'support@astralisone.com',
    organizerName: 'Astralis',
  });
}
