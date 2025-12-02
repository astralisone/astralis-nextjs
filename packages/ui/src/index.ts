/**
 * @astralis/ui - Shared UI Component Library
 *
 * Core UI components following Astralis brand specification.
 * Built on Radix UI primitives with Tailwind CSS styling.
 *
 * @version 0.0.1
 */

// Core UI Components
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
} from './components/card';

export { Input } from './components/input';
export type { InputProps } from './components/input';

export { Label } from './components/label';
export type { LabelProps } from './components/label';

export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';

export { Badge, badgeVariants } from './components/badge';
export type { BadgeProps } from './components/badge';

// Complex Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';
export type { DialogContentProps } from './components/dialog';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/select';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';

// Alert Components
export { Alert, AlertTitle, AlertDescription } from './components/alert';
export type { AlertProps } from './components/alert';

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './components/alert-dialog';

// Utility Components
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from './components/accordion';

export { Checkbox } from './components/checkbox';
export type { CheckboxProps } from './components/checkbox';

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton
} from './components/skeleton';

// Utilities
export { cn } from './lib/utils';
