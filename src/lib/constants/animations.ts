/**
 * Animation constants and presets for consistent motion design
 *
 * All animations follow these principles:
 * - Subtle and purposeful (not distracting)
 * - GPU-accelerated (transform, opacity, filter)
 * - Accessible (respects prefers-reduced-motion)
 * - Performance-first (60 FPS target)
 */

/**
 * Framer Motion spring animation presets
 */
export const ANIMATION_SPRINGS = {
  /**
   * Default spring - Balanced feel for most UI elements
   * Use for: Modals, dropdowns, tooltips
   */
  default: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
    duration: 0.4,
  },

  /**
   * Bouncy spring - Playful, energetic feel
   * Use for: Success feedback, celebration animations
   */
  bouncy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 15,
    duration: 0.5,
  },

  /**
   * Smooth spring - Gentle, refined feel
   * Use for: Page transitions, smooth reveals
   */
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    duration: 0.6,
  },

  /**
   * Snappy spring - Quick, responsive feel
   * Use for: Button feedback, micro-interactions
   */
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 18,
    duration: 0.3,
  },
} as const;

/**
 * Common animation variants for Framer Motion
 */
export const ANIMATION_VARIANTS = {
  /**
   * Fade in from bottom with scale
   * Use for: Chat messages, cards, list items
   */
  slideUp: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  },

  /**
   * Fade in/out (no movement)
   * Use for: Overlays, modals, tooltips
   */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /**
   * Scale from center
   * Use for: Popups, dialogs, confirmations
   */
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },

  /**
   * Slide from right
   * Use for: Drawers, sidebars, panels
   */
  slideFromRight: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },

  /**
   * Slide from left
   * Use for: Navigation menus, filters
   */
  slideFromLeft: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
} as const;

/**
 * CSS transition durations (in milliseconds)
 * Use for: CSS-based animations (hover, active states)
 */
export const CSS_DURATIONS = {
  instant: 100, // Ultra-fast feedback
  fast: 200, // Button interactions, hover states
  normal: 300, // Default transitions
  slow: 400, // Complex animations
  slower: 600, // Page transitions
} as const;

/**
 * CSS scale values for interactive elements
 */
export const CSS_SCALES = {
  hover: 1.02, // Subtle lift on hover
  active: 0.98, // Slight press on click
  inactive: 0.95, // Disabled state
} as const;

/**
 * Preset combinations for common use cases
 */
export const ANIMATION_PRESETS = {
  /**
   * Chat message appearance
   * Combines slideUp variant with default spring
   */
  chatMessage: {
    ...ANIMATION_VARIANTS.slideUp,
    transition: ANIMATION_SPRINGS.default,
  },

  /**
   * Button hover/active states (CSS-based)
   */
  button: {
    duration: CSS_DURATIONS.fast,
    hover: CSS_SCALES.hover,
    active: CSS_SCALES.active,
  },

  /**
   * Modal/Dialog appearance
   */
  modal: {
    ...ANIMATION_VARIANTS.scale,
    transition: ANIMATION_SPRINGS.smooth,
  },

  /**
   * Sidebar/Drawer slide-in
   */
  drawer: {
    ...ANIMATION_VARIANTS.slideFromRight,
    transition: ANIMATION_SPRINGS.snappy,
  },
} as const;
