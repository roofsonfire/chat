# Design Token System

This document describes the global design token system implemented in `src/app/globals.css`.

## Overview

The design token system provides a centralized, consistent set of design values that can be used throughout the application. All tokens are defined as CSS custom properties (variables) and are automatically available in both light and dark modes.

## Color Palette

### Primary Colors

Used for primary actions, links, and brand elements.

```css
var(--color-primary-500)  /* Base primary color */
```

**Available shades:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Secondary Colors

Used for secondary actions and supporting elements.

```css
var(--color-secondary-500)  /* Base secondary color */
```

**Available shades:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

### Accent Colors

Used for highlights, featured content, and call-to-action elements.

```css
var(--color-accent-500)  /* Base accent color */
```

**Available shades:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

## Semantic Colors

### Success

Indicates successful operations, confirmations, and positive states.

```css
var(--color-success-500)  /* Base success color */
```

**Usage example:** Form validation success, success notifications

### Error

Indicates errors, failures, and destructive actions.

```css
var(--color-error-500)  /* Base error color */
```

**Usage example:** Form validation errors, error messages, delete buttons

### Warning

Indicates warnings and caution states.

```css
var(--color-warning-500)  /* Base warning color */
```

**Usage example:** Warning messages, pending states

### Info

Indicates informational messages and neutral states.

```css
var(--color-info-500)  /* Base info color */
```

**Usage example:** Info tooltips, help text

## Typography Scale

The typography system uses a modular scale based on a 1rem (16px) base size.

### Font Sizes

```css
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px - Default body text */
var(--font-size-md)    /* 18px */
var(--font-size-lg)    /* 20px */
var(--font-size-xl)    /* 24px */
var(--font-size-2xl)   /* 32px */
var(--font-size-3xl)   /* 40px */
```

### Line Heights

```css
var(--line-height-tight)    /* 1.25 */
var(--line-height-snug)     /* 1.375 */
var(--line-height-normal)   /* 1.5 - Default */
var(--line-height-relaxed)  /* 1.625 */
var(--line-height-loose)    /* 2 */
```

### Font Weights

```css
var(--font-weight-light)     /* 300 */
var(--font-weight-normal)    /* 400 - Default */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

### HTML Element Styling

Base HTML elements are automatically styled with the typography scale:

- **h1**: 40px, bold, tight line-height
- **h2**: 32px, bold, tight line-height
- **h3**: 24px, semibold, snug line-height
- **h4**: 20px, semibold, snug line-height
- **h5**: 18px, medium, normal line-height
- **h6**: 16px, medium, normal line-height
- **p**: 16px, normal, relaxed line-height
- **small**: 14px, normal line-height
- **code**: 14px, monospace font

## Spacing Scale

The spacing system is based on an **8pt grid** (multiples of 4px/8px) for consistent visual rhythm.

```css
var(--spacing-0)   /* 0 */
var(--spacing-1)   /* 4px */
var(--spacing-2)   /* 8px */
var(--spacing-3)   /* 12px */
var(--spacing-4)   /* 16px */
var(--spacing-5)   /* 20px */
var(--spacing-6)   /* 24px */
var(--spacing-8)   /* 32px */
var(--spacing-10)  /* 40px */
var(--spacing-12)  /* 48px */
var(--spacing-16)  /* 64px */
var(--spacing-20)  /* 80px */
var(--spacing-24)  /* 96px */
```

### Usage Guidelines

- **Component padding**: Use `--spacing-4` (16px) as default
- **Section spacing**: Use `--spacing-8` or `--spacing-12` (32px or 48px)
- **Tight spacing**: Use `--spacing-2` or `--spacing-3` (8px or 12px)
- **Large spacing**: Use `--spacing-16` or `--spacing-20` (64px or 80px)

## Usage Examples

### Using Color Tokens

```tsx
// In React components with Tailwind
<div className="bg-[var(--color-primary-500)] text-white">
  Primary Button
</div>

// In CSS
.success-banner {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-300);
}
```

### Using Typography Tokens

```tsx
// In React components
<h1 style={{ fontSize: 'var(--font-size-3xl)' }}>
  Page Title
</h1>

// In CSS
.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}
```

### Using Spacing Tokens

```tsx
// In React components with Tailwind
<div className="p-[var(--spacing-4)] mb-[var(--spacing-6)]">
  Card Content
</div>

// In CSS
.section {
  padding: var(--spacing-8) var(--spacing-4);
  margin-bottom: var(--spacing-12);
}
```

## Dark Mode Support

All design tokens automatically adapt to dark mode. The system inverts the color scales:

- **Light mode**: Lower numbers (50-400) are lighter, higher numbers (600-900) are darker
- **Dark mode**: Lower numbers (50-400) are darker, higher numbers (600-900) are lighter

Typography and spacing tokens remain consistent across both modes.

## Integration with Tailwind CSS

All design tokens are exposed to Tailwind through the `@theme inline` directive. You can use them with Tailwind's arbitrary value syntax:

```tsx
<div className="p-[var(--spacing-4)] text-[var(--color-primary-500)]">
  Content
</div>
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic colors** (success, error, warning, info) for state-based styling
3. **Respect the 8pt grid** for all spacing decisions
4. **Use the typography scale** for consistent text sizing
5. **Test in both light and dark modes** to ensure proper contrast

## 8pt Grid System Implementation

All core shadcn/ui components have been updated to use the 8pt grid spacing system:

### Components Using Design Tokens

#### Button Component

```tsx
// All button sizes now use spacing tokens
<Button size="default">  {/* h-[var(--spacing-8)], px-[var(--spacing-4)] */}
<Button size="sm">       {/* h-[var(--spacing-8)], px-[var(--spacing-3)] */}
<Button size="lg">       {/* h-[var(--spacing-10)], px-[var(--spacing-6)] */}
```

**Token mapping:**

- `gap`: Uses `--spacing-2` (8px) for icon/text spacing
- `height`: Uses `--spacing-8` (32px) or `--spacing-10` (40px) depending on size
- `padding-x`: Uses `--spacing-3` to `--spacing-6` depending on size

#### Card Component

```tsx
// Card spacing now uses tokens
<Card>              {/* gap-[var(--spacing-6)], py-[var(--spacing-6)] */}
  <CardHeader>      {/* px-[var(--spacing-6)], gap-[var(--spacing-2)] */}
  <CardContent>     {/* px-[var(--spacing-6)] */}
  <CardFooter>      {/* px-[var(--spacing-6)] */}
</Card>
```

**Token mapping:**

- Inner gap: `--spacing-6` (24px) between card sections
- Horizontal padding: `--spacing-6` (24px) for all card parts
- Header gap: `--spacing-2` (8px) between title and description

#### Input Component

```tsx
// Input spacing uses tokens
<Input />  {/* h-[var(--spacing-8)], px-[var(--spacing-3)], py-[var(--spacing-1)] */}
```

**Token mapping:**

- `height`: `--spacing-8` (32px) for consistent vertical rhythm
- `padding-x`: `--spacing-3` (12px) for comfortable text entry
- `padding-y`: `--spacing-1` (4px) for vertical balance

### Guidelines for Custom Components

When creating new components, follow these spacing guidelines:

1. **Component height**: Use multiples of 8px (`--spacing-8`, `--spacing-10`, `--spacing-12`)
2. **Internal padding**: Use `--spacing-3` (12px) or `--spacing-4` (16px) as default
3. **Gaps between elements**: Use `--spacing-2` (8px) for tight spacing, `--spacing-4` (16px) for normal
4. **Section spacing**: Use `--spacing-6` (24px) or `--spacing-8` (32px) for larger sections

### Migration Example

**Before (hardcoded Tailwind values):**

```tsx
<div className="gap-6 px-4 py-2">{/* content */}</div>
```

**After (design tokens):**

```tsx
<div className="gap-[var(--spacing-6)] px-[var(--spacing-4)] py-[var(--spacing-2)]">
  {/* content */}
</div>
```

This ensures all spacing is centrally managed and consistent with the 8pt grid system.

## Related

- See [shadcn/ui Theme Customization](docs/features/shadcn-customization.md) for component-level theming
- See [Accessibility Guidelines](docs/ACCESSIBILITY.md) for color contrast requirements
