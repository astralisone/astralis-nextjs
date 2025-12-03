import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { EventForm } from '@/components/calendar/EventForm';

/**
 * CreateEventFormData
 *
 * Form data structure for creating a new calendar event.
 */
export interface CreateEventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  location: string;
  meetingLink: string;
}

/**
 * CreateEventSheetProps
 *
 * Props for the CreateEventSheet component.
 */
export interface CreateEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: CreateEventFormData) => Promise<void>;
}

/**
 * CreateEventSheet
 *
 * A sheet component for creating new calendar events. Slides in from the right
 * and contains the EventForm component for collecting event details.
 *
 * Features:
 * - Side panel with EventForm
 * - Handles form submission
 * - Managed open/close state from parent
 * - Responsive width (full on mobile, max-w-xl on desktop)
 *
 * @example
 * ```tsx
 * const [showCreateSheet, setShowCreateSheet] = useState(false);
 *
 * const handleCreateEvent = async (formData: CreateEventFormData) => {
 *   await fetch('/api/calendar/events', {
 *     method: 'POST',
 *     body: JSON.stringify(formData),
 *   });
 *   setShowCreateSheet(false);
 * };
 *
 * <CreateEventSheet
 *   open={showCreateSheet}
 *   onOpenChange={setShowCreateSheet}
 *   onSubmit={handleCreateEvent}
 * />
 * ```
 */
export function CreateEventSheet({ open, onOpenChange, onSubmit }: CreateEventSheetProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
            onSubmit={onSubmit}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
