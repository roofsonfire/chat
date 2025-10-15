export const tokens = {
  colors: {
    background: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.145 0 0)",
    },
    foreground: {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    card: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    "card-foreground": {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    popover: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    "popover-foreground": {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    primary: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.922 0 0)",
    },
    "primary-foreground": {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    secondary: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    "secondary-foreground": {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    muted: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    "muted-foreground": {
      light: "oklch(0.556 0 0)",
      dark: "oklch(0.708 0 0)",
    },
    accent: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    "accent-foreground": {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    destructive: {
      light: "oklch(0.577 0.245 27.325)",
      dark: "oklch(0.704 0.191 22.216)",
    },
    border: {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 10%)",
    },
    input: {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 15%)",
    },
    ring: {
      light: "oklch(0.4 0 0)",
      dark: "oklch(0.8 0 0)",
    },
    chart: {
      1: {
        light: "oklch(0.646 0.222 41.116)",
        dark: "oklch(0.488 0.243 264.376)",
      },
      2: {
        light: "oklch(0.6 0.118 184.704)",
        dark: "oklch(0.696 0.17 162.48)",
      },
      3: {
        light: "oklch(0.398 0.07 227.392)",
        dark: "oklch(0.769 0.188 70.08)",
      },
      4: {
        light: "oklch(0.828 0.189 84.429)",
        dark: "oklch(0.627 0.265 303.9)",
      },
      5: {
        light: "oklch(0.769 0.188 70.08)",
        dark: "oklch(0.645 0.246 16.439)",
      },
    },
    sidebar: {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    "sidebar-foreground": {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    "sidebar-primary": {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.488 0.243 264.376)",
    },
    "sidebar-primary-foreground": {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    "sidebar-accent": {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    "sidebar-accent-foreground": {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    "sidebar-border": {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 10%)",
    },
    "sidebar-ring": {
      light: "oklch(0.708 0 0)",
      dark: "oklch(0.556 0 0)",
    },
  },
  radius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
  },
} as const;

export type Tokens = typeof tokens;
