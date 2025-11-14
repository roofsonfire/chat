import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card Component
 *
 * Container component for grouping related content with consistent styling.
 * Part of the shadcn/ui card composition pattern.
 *
 * @component
 * @param {React.ComponentProps<"div">} props - Standard div props
 * @param {string} [props.className] - Additional CSS classes
 *
 * @returns {JSX.Element} Styled card container
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Feature Overview</CardTitle>
 *     <CardDescription>Key features of our platform</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Main content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Learn More</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Card with action button
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Settings</CardTitle>
 *     <CardAction>
 *       <Button variant="ghost" size="icon">
 *         <MoreVertical />
 *       </Button>
 *     </CardAction>
 *   </CardHeader>
 * </Card>
 * ```
 *
 * Features:
 * - Rounded corners with border
 * - Shadow for depth
 * - Responsive padding
 * - Flexbox layout with gap
 * - Dark mode support
 * - Works with other Card sub-components
 *
 * @see {@link CardHeader} - Card header section
 * @see {@link CardTitle} - Card title text
 * @see {@link CardDescription} - Card subtitle text
 * @see {@link CardContent} - Card main content area
 * @see {@link CardFooter} - Card footer section
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-[var(--spacing-6)] rounded-xl border py-[var(--spacing-6)] shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * CardHeader Component
 *
 * Header section of a Card, typically containing title, description, and optional actions.
 * Uses CSS Grid for responsive layout with automatic action positioning.
 *
 * @component
 * @param {React.ComponentProps<"div">} props - Standard div props
 * @param {string} [props.className] - Additional CSS classes
 *
 * @returns {JSX.Element} Card header section
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Dashboard</CardTitle>
 *   <CardDescription>Overview of your account</CardDescription>
 * </CardHeader>
 * ```
 *
 * Features:
 * - Grid layout for title/description alignment
 * - Automatic action button positioning (top-right)
 * - Container queries for responsive typography
 * - Conditional bottom border styling
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-[var(--spacing-2)] px-[var(--spacing-6)] has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-[var(--spacing-6)]",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-[var(--spacing-6)]", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-[var(--spacing-6)] [.border-t]:pt-[var(--spacing-6)]", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
