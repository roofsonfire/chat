import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input Component
 *
 * Form input field with consistent styling, focus states, and validation support.
 * Built with shadcn/ui design system.
 *
 * @component
 * @param {React.ComponentProps<"input">} props - Standard input HTML attributes
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type] - Input type (text, email, password, etc.)
 *
 * @returns {JSX.Element} Styled input element
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input
 *   type="text"
 *   placeholder="Enter your name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Email input with validation
 * <Input
 *   type="email"
 *   placeholder="email@example.com"
 *   aria-invalid={!!emailError}
 *   required
 * />
 * ```
 *
 * @example
 * ```tsx
 * // File input
 * <Input
 *   type="file"
 *   accept="image/*"
 *   onChange={handleFileUpload}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Disabled input
 * <Input
 *   type="text"
 *   value={lockedValue}
 *   disabled
 * />
 * ```
 *
 * Features:
 * - Focus ring with smooth transition
 * - Invalid state styling (red border/ring)
 * - File upload styling
 * - Placeholder text styling
 * - Text selection highlighting
 * - Dark mode support
 * - Disabled state
 * - Shadow for depth
 * - Responsive font sizing
 *
 * Accessibility:
 * - Use `aria-invalid` for validation errors
 * - Pair with `<Label>` for form accessibility
 * - Support for all standard input attributes
 *
 * @see {@link https://ui.shadcn.com/docs/components/input} shadcn/ui Input Documentation
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-[var(--spacing-8)] w-full min-w-0 rounded-md border bg-transparent px-[var(--spacing-3)] py-[var(--spacing-1)] text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
