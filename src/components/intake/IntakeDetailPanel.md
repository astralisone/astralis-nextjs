# IntakeDetailPanel Component

A sliding detail panel component for displaying and managing intake request information. Designed to work alongside a table view, sliding in from the right and taking up approximately 1/3 of the viewport width.

## Files Created

- `/src/components/intake/IntakeDetailPanel.tsx` - Main component
- `/src/components/intake/IntakeDetailPanel.stories.tsx` - Storybook stories
- `/src/components/intake/IntakeDetailPanel.example.tsx` - Integration example

## Features

- Slides in from the right with smooth animation
- Displays full intake request details:
  - Title with source icon
  - Status, priority, and source badges
  - Description (if available)
  - Created/updated timestamps
  - Pipeline assignment selector
  - Status change dropdown
  - AI routing metadata
  - Request data JSON
- Interactive controls for status changes and pipeline assignment
- Loading states during updates
- Astralis brand styling
- Responsive and accessible

## Props

```typescript
interface IntakeDetailPanelProps {
  intake: IntakeRequest;              // The intake request to display
  pipelines?: Pipeline[];             // Available pipelines for assignment
  onClose: () => void;                // Called when close button is clicked
  onStatusChange?: (status: string) => Promise<void>;  // Optional status change handler
  onPipelineAssign?: (pipelineId: string) => Promise<void>;  // Optional pipeline assignment handler
}
```

## Usage

### Basic Usage

```tsx
import { IntakeDetailPanel } from '@/components/intake';

function MyPage() {
  const [selectedIntake, setSelectedIntake] = useState<IntakeRequest | null>(null);

  return (
    <div className="flex">
      {/* Main content area */}
      <div className="flex-1">
        {/* Your table or list */}
      </div>

      {/* Detail panel */}
      {selectedIntake && (
        <div className="w-96">
          <IntakeDetailPanel
            intake={selectedIntake}
            onClose={() => setSelectedIntake(null)}
          />
        </div>
      )}
    </div>
  );
}
```

### With Full Functionality

```tsx
import { IntakeDetailPanel } from '@/components/intake';

function MyPage() {
  const [selectedIntake, setSelectedIntake] = useState<IntakeRequest | null>(null);
  const pipelines = [
    { id: 'pipeline-1', name: 'Software Development' },
    { id: 'pipeline-2', name: 'Infrastructure' },
  ];

  const handleStatusChange = async (status: string) => {
    const response = await fetch(`/api/intake/${selectedIntake?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      // Refetch or update local state
    }
  };

  const handlePipelineAssign = async (pipelineId: string) => {
    const response = await fetch(`/api/intake/${selectedIntake?.id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineId }),
    });

    if (response.ok) {
      // Refetch or update local state
    }
  };

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1">
        {/* Table */}
      </div>

      {/* Panel */}
      {selectedIntake && (
        <div className="w-96 fixed right-0 top-0 h-full">
          <IntakeDetailPanel
            intake={selectedIntake}
            pipelines={pipelines}
            onClose={() => setSelectedIntake(null)}
            onStatusChange={handleStatusChange}
            onPipelineAssign={handlePipelineAssign}
          />
        </div>
      )}
    </div>
  );
}
```

## Animation

The component is designed to slide in from the right. Recommended CSS approach:

```tsx
{selectedIntake && (
  <div className="fixed right-0 top-0 w-96 h-full animate-in slide-in-from-right duration-300">
    <IntakeDetailPanel {...props} />
  </div>
)}
```

And adjust the main content area:

```tsx
<div className={`flex-1 transition-all duration-300 ${selectedIntake ? 'mr-96' : 'mr-0'}`}>
  {/* Table content */}
</div>
```

## Status Colors

The component uses consistent status colors:

- `NEW`: Yellow (bg-yellow-100 text-yellow-700)
- `ROUTING`: Blue (bg-blue-100 text-blue-700)
- `ASSIGNED`: Purple (bg-purple-100 text-purple-700)
- `PROCESSING`: Orange (bg-orange-100 text-orange-700)
- `COMPLETED`: Green (bg-green-100 text-green-700)
- `REJECTED`: Red (bg-red-100 text-red-700)

## Priority Levels

- `0`: None (bg-slate-100 text-slate-600)
- `1`: Low (bg-blue-100 text-blue-700)
- `2`: Medium (bg-yellow-100 text-yellow-700)
- `3`: High (bg-orange-100 text-orange-700)
- `4`: Urgent (bg-red-100 text-red-700)

## Source Icons

- `FORM`: Inbox icon
- `EMAIL`: Mail icon
- `CHAT`: MessageSquare icon
- `API`: Zap icon

## Storybook

View all variations in Storybook:

```bash
npm run storybook
```

Navigate to: `Intake > IntakeDetailPanel`

Available stories:
- `NewRequest`: New intake without assignment
- `RoutingWithAI`: Request being routed by AI
- `AssignedRequest`: Assigned request with full details
- `CompletedRequest`: Completed request
- `MinimalRequest`: Minimal data
- `RejectedRequest`: Rejected request
- `ReadOnly`: Without interaction handlers

## Accessibility

- Keyboard navigation supported
- Focus states visible
- ARIA labels for interactive elements
- Screen reader friendly
- Proper semantic HTML

## Dependencies

- `lucide-react`: Icons
- `date-fns`: Date formatting
- `@/components/ui/button`: Button component
- `@/components/ui/badge`: Badge component
- `@/components/ui/select`: Select dropdown
- `@/types/pipelines`: Type definitions

## Design System Compliance

- Uses Astralis Navy (#0A1B2B) for headings
- Uses Slate palette for neutrals
- 6px border radius (md)
- 150ms transitions
- 4px spacing increments
- Consistent with brand guidelines
