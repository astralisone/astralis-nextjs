"use client";

import { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { SchedulingEvent } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";

interface CalendarViewProps {
  events: SchedulingEvent[];
  onEventClick?: (event: SchedulingEvent) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export function CalendarView({
  events,
  onEventClick,
  onDateSelect,
  className = "",
}: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>("dayGridMonth");

  // Transform Prisma events to FullCalendar format
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    backgroundColor: event.status === "CONFLICT" ? "#E53E3E" : "#2B6CB0",
    borderColor: event.status === "CONFLICT" ? "#C53030" : "#2C5282",
    extendedProps: {
      description: event.description,
      location: event.location,
      meetingLink: event.meetingLink,
      participants: event.participants,
      status: event.status,
      hasConflict: event.status === "CONFLICT",
    },
  }));

  const handleEventClick = useCallback(
    (info: any) => {
      const eventId = info.event.id;
      const event = events.find((e) => e.id === eventId);
      if (event && onEventClick) {
        onEventClick(event);
      }
    },
    [events, onEventClick]
  );

  const handleDateClick = useCallback(
    (info: any) => {
      if (onDateSelect) {
        onDateSelect(new Date(info.dateStr));
      }
    },
    [onDateSelect]
  );

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <Card className={`p-4 md:p-6 ${className}`}>
      {/* View Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        <Button
          variant={currentView === "dayGridMonth" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleViewChange("dayGridMonth")}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Month</span>
        </Button>
        <Button
          variant={currentView === "timeGridWeek" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleViewChange("timeGridWeek")}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Week</span>
        </Button>
        <Button
          variant={currentView === "timeGridDay" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleViewChange("timeGridDay")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Day</span>
        </Button>
      </div>

      {/* Calendar Component */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: "short",
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          eventContent={(eventInfo) => {
            const hasConflict = eventInfo.event.extendedProps.hasConflict;
            return (
              <div className="fc-event-content-wrapper">
                <div
                  className={`fc-event-main-frame ${
                    hasConflict ? "border-l-4 border-red-500" : ""
                  }`}
                >
                  <div className="fc-event-time text-xs">
                    {eventInfo.timeText}
                  </div>
                  <div className="fc-event-title-container">
                    <div className="fc-event-title fc-sticky font-medium">
                      {eventInfo.event.title}
                      {hasConflict && (
                        <span className="ml-1 text-xs">⚠️</span>
                      )}
                    </div>
                  </div>
                  {eventInfo.event.extendedProps.location && (
                    <div className="fc-event-location text-xs opacity-90 truncate">
                      📍 {eventInfo.event.extendedProps.location}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .calendar-container {
          --fc-border-color: #e2e8f0;
          --fc-button-bg-color: #2b6cb0;
          --fc-button-border-color: #2c5282;
          --fc-button-hover-bg-color: #2c5282;
          --fc-button-hover-border-color: #2a4365;
          --fc-button-active-bg-color: #2a4365;
          --fc-button-active-border-color: #1e3a5f;
          --fc-today-bg-color: rgba(43, 108, 176, 0.1);
        }

        .fc {
          font-family: inherit;
        }

        .fc .fc-button {
          border-radius: 6px;
          padding: 8px 12px;
          font-weight: 500;
          transition: all 200ms;
        }

        .fc .fc-button:focus {
          box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.2);
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0a1b2b;
        }

        .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
          cursor: pointer;
          transition: all 200ms;
        }

        .fc-event:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .fc-daygrid-event {
          white-space: normal;
        }

        .fc-event-main {
          color: white;
        }

        .fc-event-title {
          font-weight: 500;
        }

        .fc-event-location {
          margin-top: 2px;
        }

        .fc-day-today {
          background-color: var(--fc-today-bg-color) !important;
        }

        .fc-col-header-cell-cushion {
          color: #0a1b2b;
          font-weight: 600;
          padding: 8px 4px;
        }

        .fc-timegrid-slot-label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .fc-scrollgrid {
          border-radius: 6px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 12px;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc .fc-toolbar-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Card>
  );
}
