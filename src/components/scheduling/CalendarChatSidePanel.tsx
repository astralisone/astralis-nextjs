import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarChatPanel } from '@/components/calendar/CalendarChatPanel';
import { useUIStore } from '@/stores/useUIStore';

interface CalendarChatSidePanelProps {
  userId: string;
  orgId: string;
  onEventCreated: () => void;
}

export function CalendarChatSidePanel({
  userId,
  orgId,
  onEventCreated,
}: CalendarChatSidePanelProps) {
  const { rightPanelOpen, activeRightPanel, closeRightPanel } = useUIStore();
  const show = rightPanelOpen && activeRightPanel === 'scheduler';
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (show && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closeRightPanel();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, closeRightPanel]);

  if (!show) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-[70px] bottom-0 right-0 z-[100000] w-full sm:w-[400px] shadow-2xl transition-all duration-300 flex flex-col border-l border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-right"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <span className="text-lg font-semibold text-astralis-navy">Calendar Assistant</span>
        <Button variant="ghost" size="icon" onClick={() => closeRightPanel()}>
          <X className="h-[24px] w-[24px]" />
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
