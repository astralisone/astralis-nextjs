import { SchedulingEvent } from '@prisma/client';

export type EventFilter = 'all' | 'my' | 'team';

export interface EventStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  conflicts: number;
}

export type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CONFLICT';

export interface EventCardData {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  participants: string[];
  status: EventStatus;
}

export function mapSchedulingEventToCardData(event: SchedulingEvent): EventCardData {
  return {
    id: event.id,
    title: event.title,
    description: event.description || undefined,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location || undefined,
    meetingLink: event.meetingLink || undefined,
    participants: event.participantEmails || [],
    status: event.status as EventStatus,
  };
}
