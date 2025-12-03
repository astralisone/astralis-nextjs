import { SchedulingEvent } from '@prisma/client';
import { Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/calendar/EventCard';
import { mapSchedulingEventToCardData } from './types';

interface EventDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SchedulingEvent | null;
  onAccept: (eventId: string) => void;
  onDecline: (eventId: string) => void;
  updatingEventId: string | null;
}

export function EventDetailsSheet({
  open,
  onOpenChange,
  event,
  onAccept,
  onDecline,
  updatingEventId,
}: EventDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{event?.title || 'Event Details'}</SheetTitle>
          <SheetDescription>
            View and manage event details
          </SheetDescription>
        </SheetHeader>
        {event && (
          <div className="mt-6 space-y-4">
            <EventCard
              event={mapSchedulingEventToCardData(event)}
              onAccept={onAccept}
              onDecline={onDecline}
              isUpdating={updatingEventId === event.id}
            />

            {/* Additional Event Details */}
            {event.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {event.participantEmails && event.participantEmails.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Participants ({event.participantEmails.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.participantEmails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <Users className="h-4 w-4 text-slate-400" />
                        {email}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {event.meetingLink && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Meeting Link
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-astralis-blue hover:underline"
                  >
                    {event.meetingLink}
                  </a>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
