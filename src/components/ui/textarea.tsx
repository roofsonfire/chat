import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Props for the Textarea component
 */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea Component
 *
 * Multi-line text input with consistent styling and focus states.
 * Built with React forwardRef for form library compatibility.
 *
 * @component
 * @param {TextareaProps} props - Standard textarea HTML attributes
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.rows] - Number of visible text lines
 * @param {number} [props.cols] - Number of visible text columns
 * @param {boolean} [props.disabled] - Disabled state
 * @param {React.Ref<HTMLTextAreaElement>} ref - Forwarded ref
 *
 * @returns {JSX.Element} Styled textarea element
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea
 *   placeholder="Enter your message..."
 *   value={message}
 *   onChange={(e) => setMessage(e.target.value)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With specific dimensions
 * <Textarea
 *   rows={5}
 *   placeholder="Write a description..."
 *   maxLength={500}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With form library (react-hook-form)
 * const { register } = useForm();
 *
 * <Textarea
 *   {...register("description", { required: true })}
 *   placeholder="Description"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Disabled state
 * <Textarea
 *   value={lockedText}
 *   disabled
 * />
 * ```
 *
 * Features:
 * - Minimum height of 80px
 * - Auto-resize not included (use react-textarea-autosize for that)
 * - Focus ring with offset
 * - Disabled state styling
 * - Placeholder text styling
 * - Full width by default
 * - Forward ref support
 * - Border and shadow styling
 *
 * Accessibility:
 * - Use with `<Label>` for form accessibility
 * - Support for all standard textarea attributes
 * - Proper focus management
 *
 * @see {@link https://ui.shadcn.com/docs/components/textarea} shadcn/ui Textarea Documentation
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
