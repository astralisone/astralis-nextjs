import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * Tabs component following Astralis brand specification (Section 3.3)
 *
 * Built on Radix UI Tabs primitive for full accessibility support.
 *
 * Features:
 * - Keyboard navigation (arrow keys)
 * - ARIA attributes for screen readers
 * - Focus management
 * - Astralis Blue accent for active tab
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="executions">Executions</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">Overview content</TabsContent>
 *   <TabsContent value="executions">Executions content</TabsContent>
 *   <TabsContent value="settings">Settings content</TabsContent>
 * </Tabs>
 * ```
 */

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-white data-[state=active]:text-astralis-blue data-[state=active]:shadow-sm",
      "hover:text-astralis-navy",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astralis-blue focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
