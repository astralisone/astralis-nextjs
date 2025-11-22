'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { SchedulingEvent } from '@prisma/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventCard } from '@/components/calendar/EventCard';
import { EventForm } from '@/components/calendar/EventForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  X,
} from 'lucide-react';
import { CalendarChatPanel } from '@/components/calendar/CalendarChatPanel';
import { cn } from '@/lib/utils';

type EventFilter = 'all' | 'my' | 'team';

interface EventStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  conflicts: number;
}

/**
 * Scheduling Page
 * Dashboard for viewing and managing scheduled events with calendar integration
 */
export default function SchedulingPage() {
  // Session
  const { data: session } = useSession();

  // State
  const [events, setEvents] = useState<SchedulingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>('all');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchedulingEvent | null>(null);
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // Get userId and orgId from session
  const userId = session?.user?.id || '';
  const orgId = (session?.user as any)?.orgId || '';

  /**
   * Fetch events from API
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/calendar/events');

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /**
   * Handle event creation
   */
  const handleCreateEvent = async (formData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    participants: string[];
    location: string;
    meetingLink: string;
  }) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: formData.participants,
          location: formData.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      setShowCreateSheet(false);
      await fetchEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      console.error('Error creating event:', err);
      throw new Error(errorMessage);
    }
  };

  /**
   * Handle event click in calendar
   */
  const handleEventClick = (event: SchedulingEvent) => {
    setSelectedEvent(event);
    setShowEventSheet(true);
  };

  /**
   * Handle date selection in calendar
   */
  const handleDateSelect = (date: Date) => {
    // Pre-fill the date when opening the create form
    setShowCreateSheet(true);
  };

  /**
   * Filter events based on selected filter
   */
  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'my' && session?.user?.id) {
      return event.userId === session.user.id;
    }
    if (filter === 'team') {
      // Show events where the user is a participant but not the owner
      return event.userId !== session?.user?.id;
    }
    return true;
  });

  /**
   * Get upcoming events (next 10 events sorted by start time)
   */
  const upcomingEvents = [...filteredEvents]
    .filter((event) => new Date(event.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10);

  /**
   * Calculate event statistics
   */
  const stats: EventStats = {
    total: events.length,
    scheduled: events.filter((e) => e.status === 'SCHEDULED').length,
    confirmed: events.filter((e) => e.status === 'CONFIRMED').length,
    completed: events.filter((e) => e.status === 'COMPLETED').length,
    conflicts: events.filter((e) => e.status === 'CONFLICT').length,
  };

  return (
    <PageContainer>
      <div className={cn(
        'transition-all duration-300',
        showChatPanel ? 'mr-[400px]' : ''
      )}>
      {/* Header */}
      <PageHeader
        title="Scheduling"
        description="Manage your calendar events and meetings"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={fetchEvents}
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="primary" className="gap-2" onClick={() => setShowCreateSheet(true)}>
              <Plus className="h-5 w-5" />
              Create Event
            </Button>
            <Button
              variant={showChatPanel ? 'primary' : 'outline'}
              className="gap-2"
              onClick={() => setShowChatPanel(!showChatPanel)}
            >
              <MessageSquare className="h-5 w-5" />
              {showChatPanel ? 'Hide Chat' : 'Chat Assistant'}
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Events</p>
                <p className="text-2xl font-bold text-astralis-navy">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="text-2xl font-bold text-astralis-blue">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Confirmed</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Conflicts</p>
                <p className="text-2xl font-bold text-warning">{stats.conflicts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <div className="mt-6">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as EventFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="my">My Events</TabsTrigger>
            <TabsTrigger value="team">Team Events</TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {/* Error State */}
            {error && (
              <Alert variant="error" showIcon className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <Skeleton className="h-96 w-full" />
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card className="p-4">
                    <Skeleton className="h-6 w-32 mb-4" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24 w-full mb-3" />
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredEvents.length === 0 && (
              <EmptyState
                icon={Calendar}
                title="No events found"
                description={
                  filter !== 'all'
                    ? 'Try selecting a different filter to see more events'
                    : 'Get started by creating your first event'
                }
                primaryAction={{
                  label: 'Create Event',
                  onClick: () => setShowCreateSheet(true),
                }}
              />
            )}

            {/* Main Content */}
            {!loading && !error && filteredEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                  <CalendarView
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    onDateSelect={handleDateSelect}
                  />
                </div>

                {/* Upcoming Events Sidebar */}
                <div>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-astralis-navy">
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingEvents.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No upcoming events
                        </p>
                      ) : (
                        upcomingEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={{
                              id: event.id,
                              title: event.title,
                              description: event.description || undefined,
                              startTime: event.startTime,
                              endTime: event.endTime,
                              location: event.location || undefined,
                              meetingLink: event.meetingLink || undefined,
                              participants: event.participantEmails || [],
                              status: event.status as 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CONFLICT',
                            }}
                            onClick={() => handleEventClick(event)}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>

      {/* Chat Panel */}
      {showChatPanel && (
        <div className="fixed right-0 top-16 bottom-0 w-[400px] border-l border-slate-200 bg-white shadow-lg z-40">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="text-lg font-semibold text-astralis-navy">Calendar Assistant</span>
            <Button variant="ghost" size="icon" onClick={() => setShowChatPanel(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[calc(100%-60px)]">
            <CalendarChatPanel
              userId={userId}
              orgId={orgId}
              onEventCreated={fetchEvents}
            />
          </div>
        </div>
      )}

      {/* Create Event Sheet */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Event</SheetTitle>
            <SheetDescription>
              Schedule a new meeting or event with participants
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <EventForm
              mode="create"
              onSubmit={handleCreateEvent}
              onCancel={() => setShowCreateSheet(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Event Details Sheet */}
      <Sheet open={showEventSheet} onOpenChange={setShowEventSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedEvent?.title || 'Event Details'}</SheetTitle>
            <SheetDescription>
              View and manage event details
            </SheetDescription>
          </SheetHeader>
          {selectedEvent && (
            <div className="mt-6 space-y-4">
              <EventCard
                event={{
                  id: selectedEvent.id,
                  title: selectedEvent.title,
                  description: selectedEvent.description || undefined,
                  startTime: selectedEvent.startTime,
                  endTime: selectedEvent.endTime,
                  location: selectedEvent.location || undefined,
                  meetingLink: selectedEvent.meetingLink || undefined,
                  participants: selectedEvent.participantEmails || [],
                  status: selectedEvent.status as 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CONFLICT',
                }}
              />

              {/* Additional Event Details */}
              {selectedEvent.description && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{selectedEvent.description}</p>
                  </CardContent>
                </Card>
              )}

              {selectedEvent.participantEmails && selectedEvent.participantEmails.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Participants ({selectedEvent.participantEmails.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedEvent.participantEmails.map((email, index) => (
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

              {selectedEvent.meetingLink && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Meeting Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-astralis-blue hover:underline"
                    >
                      {selectedEvent.meetingLink}
                    </a>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEventSheet(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
