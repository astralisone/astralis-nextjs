# Astralis Component Library

**Version:** 1.0
**Specification:** astralis-branded-refactor.md Section 3.3
**Location:** `/src/components/ui/`

## Overview

Brand-compliant UI components following the Astralis master specification. All components use the `cn()` utility for class merging and are built with TypeScript and Radix UI primitives where applicable.

## Design Tokens

### Colors
- **Astralis Navy:** `#0A1B2B`
- **Astralis Blue:** `#2B6CB0`
- **Slate-100:** `#F7FAFC`
- **Slate-300:** `#E2E8F0` (borders)
- **Slate-500:** `#718096`
- **Slate-700:** `#2D3748`
- **Slate-900:** `#1A202C`

### Spacing
Following 4/8/12/16/20/24/32/48/64/96 px increments (Section 3.2)

### Animation Timing
150-250ms transitions (Section 2.2)

---

## Components

### 1. Card Component

**File:** `/src/components/ui/card.tsx`

#### Specifications
- Background: White
- Border: 1px #E2E8F0 (Slate-300)
- Shadow: rgba(0,0,0,0.06)
- Padding: 24-32px (via CardHeader, CardContent, CardFooter)
- Border Radius: 8px

#### Sub-components
- `Card` - Main container
- `CardHeader` - Header with padding
- `CardTitle` - H3 heading (24px, semibold)
- `CardDescription` - Subtitle text (sm, slate-500)
- `CardContent` - Main content area
- `CardFooter` - Footer with flex layout

#### Usage
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Implementation Notes
- Uses `forwardRef` for ref compatibility
- All sub-components accept `className` for customization
- Shadow has 200ms transition for hover effects

---

### 2. Input Component

**File:** `/src/components/ui/input.tsx`

#### Specifications
- Border: Slate-300 (#E2E8F0)
- Border Radius: 6px
- No default shadow
- Focus ring: 2px Astralis Blue
- Transition: 150ms ease-out
- Height: 40px (h-10)

#### Usage
```tsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  placeholder="Enter text..."
  className="w-full"
/>
```

#### Props
Extends `React.InputHTMLAttributes<HTMLInputElement>`

#### Implementation Notes
- Supports all standard input types
- File input styling included
- Disabled state with 50% opacity
- Placeholder text in slate-500

---

### 3. Textarea Component

**File:** `/src/components/ui/textarea.tsx`

#### Specifications
- Same styling as Input component
- Border: Slate-300 (#E2E8F0)
- Border Radius: 6px
- No default shadow
- Focus ring: 2px Astralis Blue
- Transition: 150ms ease-out
- Min-height: 80px

#### Usage
```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  placeholder="Enter message..."
  rows={4}
  className="w-full"
/>
```

#### Props
Extends `React.TextareaHTMLAttributes<HTMLTextAreaElement>`

#### Implementation Notes
- Vertically resizable by default
- Can be set to `resize-none` via className
- Maintains consistent styling with Input

---

### 4. Select Component

**File:** `/src/components/ui/select.tsx`

#### Specifications
- Built on Radix UI Select primitive
- Matches Input component styling
- Border: Slate-300 (#E2E8F0)
- Border Radius: 6px
- Focus ring: 2px Astralis Blue
- Astralis Blue accents for selected items
- Transition: 150ms ease-out

#### Sub-components
- `Select` - Root component
- `SelectTrigger` - Button to open dropdown
- `SelectValue` - Displays selected value
- `SelectContent` - Dropdown container
- `SelectItem` - Individual option
- `SelectLabel` - Group label
- `SelectGroup` - Option grouping
- `SelectSeparator` - Divider
- `SelectScrollUpButton` - Scroll indicator
- `SelectScrollDownButton` - Scroll indicator

#### Usage
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

#### With Groups
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Group 1</SelectLabel>
      <SelectItem value="1">Item 1</SelectItem>
      <SelectItem value="2">Item 2</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Group 2</SelectLabel>
      <SelectItem value="3">Item 3</SelectItem>
      <SelectItem value="4">Item 4</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

#### Implementation Notes
- Check icon appears on selected items (Astralis Blue)
- Keyboard navigation supported (Radix UI)
- Portal rendering for proper z-index handling
- Animations: fade-in/out, zoom, slide
- Focus styling matches Input component

---

## Import Patterns

### Individual Imports
```tsx
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
```

### Barrel Import (Recommended)
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui";
```

---

## Accessibility

All components follow accessibility best practices:

- **Keyboard Navigation:** Full support via Radix UI primitives
- **ARIA Attributes:** Automatically handled by Radix UI
- **Focus Management:** Visible focus rings (2px Astralis Blue)
- **Color Contrast:** WCAG AA compliant
- **Screen Readers:** Proper semantic HTML and ARIA labels

---

## Demo Page

Visit `/component-demo` to see all components in action with interactive examples.

**File:** `/src/app/component-demo/page.tsx`

---

## Component Architecture

### Design Principles
1. **Composition:** Components built from smaller primitives
2. **Consistency:** Unified styling across all form elements
3. **Flexibility:** Extensible via className prop
4. **Type Safety:** Full TypeScript support
5. **Accessibility:** WCAG AA compliance

### Technical Stack
- **React 19:** forwardRef, TypeScript types
- **Radix UI:** Accessible primitives (Select)
- **Tailwind CSS 4:** Utility-first styling
- **CVA:** Class variance authority for variants
- **Lucide React:** Icon system (ChevronDown, Check)

### Utility Functions
```typescript
// /src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Testing

### Visual Testing
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3001/component-demo`
3. Test all interactive states (hover, focus, active)

### Build Testing
```bash
npm run build
```

All components must pass TypeScript compilation and Next.js build process.

---

## Future Enhancements

Planned components based on Section 3.3:

- [ ] Button variants (already implemented in button.tsx)
- [ ] Navigation component (Desktop + Mobile)
- [ ] Hero template component
- [ ] Modal/Dialog
- [ ] Toast notifications
- [ ] Tabs
- [ ] Accordion
- [ ] Table

---

## Maintenance

### Adding New Components
1. Create component file in `/src/components/ui/`
2. Follow existing patterns (forwardRef, cn utility, TypeScript)
3. Add JSDoc comments referencing specification sections
4. Export from `/src/components/ui/index.ts`
5. Add to this documentation
6. Create demo in `/component-demo` page

### Styling Updates
All color tokens and spacing should reference the specification in `astralis-branded-refactor.md` Section 2.3 and 3.2.

---

## Reference

- **Master Specification:** `/astralis-branded-refactor.md`
- **Component Location:** `/src/components/ui/`
- **Demo Page:** `/src/app/component-demo/page.tsx`
- **Utility Functions:** `/src/lib/utils.ts`
- **Tailwind Config:** `/tailwind.config.ts`

---

**Last Updated:** 2025-11-18
**Maintained By:** Component Architect Agent
