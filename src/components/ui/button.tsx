import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button variant configuration using class-variance-authority.
 * Defines all possible button styles and sizes.
 *
 * Variants:
 * - `default`: Primary action button with filled background
 * - `destructive`: Dangerous action (delete, remove) with red styling
 * - `outline`: Secondary action with border and transparent background
 * - `secondary`: Alternative action with muted background
 * - `ghost`: Minimal button without background (until hovered)
 * - `link`: Text-only button with underline on hover
 *
 * Sizes:
 * - `default`: Standard height (36px / h-9)
 * - `sm`: Small height (32px / h-8)
 * - `lg`: Large height (40px / h-10)
 * - `icon`: Square icon-only (36x36px / size-9)
 * - `icon-sm`: Small square icon (32x32px / size-8)
 * - `icon-lg`: Large square icon (40x40px / size-10)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button Component
 *
 * Versatile button component built on Radix UI with shadcn/ui styling.
 * Supports multiple variants, sizes, and can be rendered as a child component
 * using the Radix Slot pattern.
 *
 * @component
 * @param {object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {"default"|"destructive"|"outline"|"secondary"|"ghost"|"link"} [props.variant="default"] - Visual style variant
 * @param {"default"|"sm"|"lg"|"icon"|"icon-sm"|"icon-lg"} [props.size="default"] - Button size
 * @param {boolean} [props.asChild=false] - Render as Slot (passes props to child)
 * @param {React.ComponentProps<"button">} props - All standard button HTML attributes
 *
 * @returns {JSX.Element} Styled button element
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button>Click me</Button>
 * ```
 *
 * @example
 * ```tsx
 * // Destructive button with icon
 * <Button variant="destructive" size="sm">
 *   <Trash2 />
 *   Delete
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * // Icon-only button
 * <Button variant="ghost" size="icon">
 *   <Settings />
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * // As child (renders as Link but looks like Button)
 * <Button asChild>
 *   <Link href="/dashboard">Dashboard</Link>
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * // Disabled state
 * <Button disabled>
 *   Loading...
 * </Button>
 * ```
 *
 * Features:
 * - Consistent focus and hover states
 * - Automatic icon sizing and spacing
 * - Dark mode support
 * - Accessibility (disabled, aria attributes)
 * - Polymorphic with `asChild` prop
 * - Invalid state styling
 * - Smooth transitions
 *
 * @see {@link https://ui.shadcn.com/docs/components/button} shadcn/ui Button Documentation
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
