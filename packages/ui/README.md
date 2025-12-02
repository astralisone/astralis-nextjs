# @astralis/ui

Shared UI component library for Astralis One platform.

## Overview

This package contains core UI components following the Astralis brand specification. All components are built on Radix UI primitives with Tailwind CSS styling for consistency across the platform.

## Components

### Form Components
- **Button** - Primary, secondary, destructive, outline, ghost, and link variants
- **Input** - Text input with brand styling
- **Label** - Accessible form labels
- **Textarea** - Multi-line text input
- **Select** - Dropdown select with keyboard navigation
- **Checkbox** - Accessible checkbox with indeterminate state

### Layout Components
- **Card** - Container with header, content, and footer
- **Dialog** - Modal dialogs with overlay
- **Tabs** - Tabbed content panels
- **Accordion** - Collapsible content sections

### Feedback Components
- **Alert** - Contextual feedback messages (success, error, warning, info)
- **AlertDialog** - Confirmation dialogs
- **Badge** - Status badges
- **Skeleton** - Loading placeholders

### Navigation Components
- **DropdownMenu** - Context menus with nested support

## Installation

This package is not published to npm. It's used internally as a workspace package.

```bash
# From the root of the monorepo
npm install
```

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@astralis/ui';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="primary" size="lg">
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Design System

All components follow the Astralis brand specification:

### Colors
- **Astralis Navy** (#0A1B2B) - Primary headings
- **Astralis Blue** (#2B6CB0) - Primary actions
- **Slate** (50-950) - Neutral scale
- **Status Colors** - Success, warning, error, info

### Typography
- **Font Family**: Inter (primary)
- **Headings**: Bold, Astralis Navy
- **Body**: Regular, Slate-700

### Spacing
- 4px increments: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96

### Border Radius
- Small: 4px
- Medium: 6px
- Large: 8px

### Transitions
- Fast: 150ms
- Normal: 200ms
- Slow: 250ms

## Development

```bash
# Build TypeScript
npm run build

# Lint
npm run lint
```

## Dependencies

- React 18.3+
- Radix UI primitives
- Tailwind CSS
- class-variance-authority
- lucide-react (icons)

## License

Private - Internal use only
