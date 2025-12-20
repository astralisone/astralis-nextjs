import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarChatPanel } from '@/components/calendar/CalendarChatPanel';

interface CalendarChatSidePanelProps {
  show: boolean;
  onClose: () => void;
  userId: string;
  orgId: string;
  onEventCreated: () => void;
}

export function CalendarChatSidePanel({
  show,
  onClose,
  userId,
  orgId,
  onEventCreated,
}: CalendarChatSidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (show && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={panelRef}
      className="fixed right-0 top-16 bottom-0 w-full sm:w-[400px] border-l border-slate-200 bg-white shadow-lg z-40"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <span className="text-lg font-semibold text-astralis-navy">Calendar Assistant</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100%-60px)]">
        <CalendarChatPanel
          userId={userId}
          orgId={orgId}
          onEventCreated={onEventCreated}
        />
      </div>
    </div>
  );
}
