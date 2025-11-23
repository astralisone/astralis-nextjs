# Calendar UI Components - Phase 5

Complete set of Astralis-branded calendar management components for scheduling, availability management, and conflict detection.

## Components Overview

### 1. CalendarView
Full-featured calendar display with month/week/day views.

**Features:**
- Multiple view modes (month, week, day)
- Event display with conflict indicators
- Interactive date/event selection
- FullCalendar integration
- Responsive design

**Usage:**
```tsx
import { CalendarView } from "@/components/calendar";

<CalendarView
  events={events}
  onEventClick={(event) => console.log(event)}
  onDateSelect={(date) => console.log(date)}
/>
```

**Props:**
- `events: any[]` - Array of event objects
- `onEventClick?: (event) => void` - Event click handler
- `onDateSelect?: (date) => void` - Date selection handler

---

### 2. EventForm
Create and edit events with validation and conflict detection.

**Features:**
- Multi-field event form
- Real-time conflict checking
- AI time slot suggestions
- Email chip input for participants
- Form validation with error messages
- Loading states

**Usage:**
```tsx
import { EventForm } from "@/components/calendar";

<EventForm
  event={existingEvent} // Optional for edit mode
  onSubmit={(data) => handleSubmit(data)}
  onCancel={() => setShowForm(false)}
  mode="create" // or "edit"
/>
```

**Props:**
- `event?: any` - Existing event for edit mode
- `onSubmit: (data) => void` - Form submission handler
- `onCancel: () => void` - Cancel handler
- `mode: "create" | "edit"` - Form mode

**Form Fields:**
- Title (required)
- Description
- Start/End Date & Time (required)
- Participants (email list, required)
- Location
- Meeting Link

---

### 3. ConflictDetector
Visual conflict warning component with severity levels.

**Features:**
- Severity-based styling (low/medium/high)
- Conflicting events list
- Affected participants display
- Recommendations for high-severity conflicts

**Usage:**
```tsx
import { ConflictDetector } from "@/components/calendar";

<ConflictDetector
  conflicts={conflictingEvents}
  severity="high" // Optional: "low" | "medium" | "high"
/>
```

**Props:**
- `conflicts: any[]` - Array of conflicting events
- `severity?: "low" | "medium" | "high"` - Conflict severity level

---

### 4. AvailabilityEditor
Weekly availability grid with time range management.

**Features:**
- 7-day weekly grid
- Multiple time ranges per day
- Toggle days on/off
- Visual time blocks
- Timezone selector
- Add/remove time ranges

**Usage:**
```tsx
import { AvailabilityEditor } from "@/components/calendar";

<AvailabilityEditor
  rules={availabilityRules}
  onSave={(rules) => handleSave(rules)}
/>
```

**Props:**
- `rules: any[]` - Array of availability rules
- `onSave: (rules) => void` - Save handler

**Rule Format:**
```typescript
{
  dayOfWeek: "Monday",
  isAvailable: true,
  timeRanges: [{ start: "09:00", end: "17:00" }],
  timezone: "America/New_York"
}
```

---

### 5. CalendarConnectionCard
Display and manage external calendar connections.

**Features:**
- Provider icons (Google/Microsoft/Apple)
- Last sync timestamp
- Sync error display
- Manual sync button
- Disconnect functionality
- Active/inactive status

**Usage:**
```tsx
import { CalendarConnectionCard } from "@/components/calendar";

<CalendarConnectionCard
  connection={calendarConnection}
  onDisconnect={() => handleDisconnect()}
  onSync={() => handleSync()}
/>
```

**Props:**
- `connection: CalendarConnection` - Connection object
- `onDisconnect: () => void` - Disconnect handler
- `onSync: () => void` - Sync handler

**Connection Format:**
```typescript
{
  id: string;
  provider: "google" | "microsoft" | "apple";
  email: string;
  lastSyncedAt: Date | string;
  syncErrorCount?: number;
  syncErrorMessage?: string;
  isActive: boolean;
}
```

---

### 6. TimeSlotSuggestions
AI-powered time slot suggestions with confidence scores.

**Features:**
- Top 5 suggestions display
- Confidence scoring (0-100%)
- AI reasoning display
- Conflict-free indicators
- Available participants count
- One-click selection

**Usage:**
```tsx
import { TimeSlotSuggestions } from "@/components/calendar";

<TimeSlotSuggestions
  suggestions={aiSuggestions}
  onSelect={(slot) => handleSelectSlot(slot)}
/>
```

**Props:**
- `suggestions: TimeSlot[]` - Array of suggested time slots
- `onSelect: (slot) => void` - Selection handler

**Slot Format:**
```typescript
{
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  confidence: number; // 0-100
  reasoning?: string;
  hasConflicts?: boolean;
  availableParticipants?: string[];
}
```

---

### 7. ReminderSettings
Configure event reminders with preset and custom times.

**Features:**
- Preset time offsets (5min, 15min, 30min, 1hr, 1 day)
- Custom time input
- Multiple reminders per event
- Email notification method
- Add/remove reminders

**Usage:**
```tsx
import { ReminderSettings } from "@/components/calendar";

<ReminderSettings
  reminders={eventReminders}
  onChange={(reminders) => handleChange(reminders)}
/>
```

**Props:**
- `reminders: Reminder[]` - Array of reminder objects
- `onChange: (reminders) => void` - Change handler

**Reminder Format:**
```typescript
{
  id?: string;
  offsetMinutes: number; // Minutes before event
  method: "email";
}
```

---

### 8. EventCard
Compact event display card for lists and grids.

**Features:**
- Event details display
- Status indicators (5 statuses)
- Conflict badges
- Meeting link icon
- Participant count
- "Today" badge
- Hover effects

**Usage:**
```tsx
import { EventCard } from "@/components/calendar";

<EventCard
  event={event}
  onClick={() => handleEventClick(event)}
/>
```

**Props:**
- `event: EventObject` - Event data
- `onClick?: () => void` - Click handler

**Event Format:**
```typescript
{
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  location?: string;
  meetingLink?: string;
  participants?: string[];
  status?: "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "CONFLICT";
  conflicts?: any[];
}
```

---

## Astralis Brand Design

All components follow the Astralis brand design system:

**Colors:**
- Navy: `#0A1B2B` (headings, dark text)
- Blue: `#2B6CB0` (primary actions, links)
- Success: `#38A169` (available, confirmed)
- Warning: `#DD6B20` (medium severity)
- Error: `#E53E3E` (conflicts, errors)

**Design Tokens:**
- Border radius: 6px (md), 8px (lg), 4px (sm)
- Transitions: 150-200ms
- Shadows: `card` and `card-hover`
- Spacing: 4px increments

**Typography:**
- Font family: Inter (via next/font/google)
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## Installation & Dependencies

All required dependencies are already installed:

```json
{
  "@fullcalendar/react": "^6.1.19",
  "@fullcalendar/daygrid": "^6.1.19",
  "@fullcalendar/timegrid": "^6.1.19",
  "@fullcalendar/interaction": "^6.1.19",
  "date-fns": "^4.1.0",
  "lucide-react": "latest"
}
```

---

## Common Patterns

### 1. Import Components
```tsx
// Single import
import { CalendarView } from "@/components/calendar";

// Multiple imports
import {
  CalendarView,
  EventForm,
  ConflictDetector,
} from "@/components/calendar";
```

### 2. Client Components
All components use `"use client"` directive for Next.js App Router.

### 3. TypeScript Types
Components accept flexible prop types but include interface definitions for clarity.

### 4. Error Handling
All components handle loading states and errors gracefully with user feedback.

### 5. Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

---

## Example Page Integration

```tsx
"use client";

import { useState } from "react";
import {
  CalendarView,
  EventForm,
  EventCard,
  ConflictDetector,
} from "@/components/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CalendarView
        events={events}
        onEventClick={(event) => console.log(event)}
        onDateSelect={(date) => setShowEventForm(true)}
      />

      {showEventForm && (
        <EventForm
          mode="create"
          onSubmit={(data) => {
            // Handle event creation
            setShowEventForm(false);
          }}
          onCancel={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
}
```

---

## API Integration

Components expect these API endpoints:

- `POST /api/scheduling/conflicts` - Check for conflicts
- `POST /api/scheduling/suggest` - Get AI time suggestions
- `GET /api/scheduling/events` - Fetch events
- `POST /api/scheduling/events` - Create event
- `PUT /api/scheduling/events/:id` - Update event
- `DELETE /api/scheduling/events/:id` - Delete event

---

## Testing

Components are production-ready and include:
- TypeScript type safety
- Form validation
- Error boundaries
- Loading states
- Responsive design (mobile/tablet/desktop)

---

## File Structure

```
src/components/calendar/
├── CalendarView.tsx             # Main calendar component
├── EventForm.tsx                # Event creation/editing form
├── ConflictDetector.tsx         # Conflict warning display
├── AvailabilityEditor.tsx       # Weekly availability grid
├── CalendarConnectionCard.tsx   # External calendar connection
├── TimeSlotSuggestions.tsx      # AI time suggestions
├── ReminderSettings.tsx         # Reminder configuration
├── EventCard.tsx                # Compact event card
├── index.ts                     # Barrel export file
└── README.md                    # This file
```

---

## Support

For issues or questions about these components, refer to:
- Project documentation: `/CLAUDE.md`
- Brand specification: `/astralis-branded-refactor.md`
- UI components: `/src/components/ui/`
