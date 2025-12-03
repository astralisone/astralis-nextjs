'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { SchedulingEvent } from '@prisma/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, RefreshCw, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Scheduling components
import { EventFilter, EventStats } from '@/components/scheduling/types';
import { SchedulingStatsCards } from '@/components/scheduling/SchedulingStatsCards';
import { SchedulingLoadingState } from '@/components/scheduling/SchedulingLoadingState';
import { UpcomingEventsSidebar } from '@/components/scheduling/UpcomingEventsSidebar';
import { EventDetailsSheet } from '@/components/scheduling/EventDetailsSheet';
import { CreateEventSheet } from '@/components/scheduling/CreateEventSheet';
import { CalendarChatSidePanel } from '@/components/scheduling/CalendarChatSidePanel';

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
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);

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
   * Handle accepting an event
   */
  const handleAcceptEvent = async (eventId: string) => {
    setUpdatingEventId(eventId);
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept event');
      }

      toast({
        title: 'Event Accepted',
        description: 'The event has been confirmed',
      });

      await fetchEvents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to accept event',
        variant: 'destructive',
      });
    } finally {
      setUpdatingEventId(null);
    }
  };

  /**
   * Handle declining an event
   */
  const handleDeclineEvent = async (eventId: string) => {
    setUpdatingEventId(eventId);
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decline event');
      }

      toast({
        title: 'Event Declined',
        description: 'The event has been cancelled',
      });

      await fetchEvents();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to decline event',
        variant: 'destructive',
      });
    } finally {
      setUpdatingEventId(null);
    }
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
        <SchedulingStatsCards stats={stats} />

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
              {loading && <SchedulingLoadingState />}

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
                    <UpcomingEventsSidebar
                      events={upcomingEvents}
                      onEventClick={handleEventClick}
                      onAccept={handleAcceptEvent}
                      onDecline={handleDeclineEvent}
                      updatingEventId={updatingEventId}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Panel */}
      <CalendarChatSidePanel
        show={showChatPanel}
        onClose={() => setShowChatPanel(false)}
        userId={userId}
        orgId={orgId}
        onEventCreated={fetchEvents}
      />

      {/* Create Event Sheet */}
      <CreateEventSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        onSubmit={handleCreateEvent}
      />

      {/* Event Details Sheet */}
      <EventDetailsSheet
        open={showEventSheet}
        onOpenChange={setShowEventSheet}
        event={selectedEvent}
        onAccept={handleAcceptEvent}
        onDecline={handleDeclineEvent}
        updatingEventId={updatingEventId}
      />
    </PageContainer>
  );
}
