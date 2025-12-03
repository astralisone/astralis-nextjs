import { SchedulingEvent } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EventCard } from '@/components/calendar/EventCard';
import { mapSchedulingEventToCardData } from './types';

interface UpcomingEventsSidebarProps {
  events: SchedulingEvent[];
  onEventClick: (event: SchedulingEvent) => void;
  onAccept: (eventId: string) => void;
  onDecline: (eventId: string) => void;
  updatingEventId: string | null;
}

export function UpcomingEventsSidebar({
  events,
  onEventClick,
  onAccept,
  onDecline,
  updatingEventId,
}: UpcomingEventsSidebarProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-astralis-navy">
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No upcoming events
          </p>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={mapSchedulingEventToCardData(event)}
              onClick={() => onEventClick(event)}
              onAccept={onAccept}
              onDecline={onDecline}
              isUpdating={updatingEventId === event.id}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
