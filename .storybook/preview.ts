import type { Preview } from "@storybook/nextjs-vite";
import { vi } from "vitest";

// Mock fetch for Storybook stories
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: () =>
      Promise.resolve({
        models: [
          {
            name: "gemini-2.5-flash-image",
            displayName: "Gemini 2.5 Flash with Image",
            description: "Fast model with image capabilities",
          },
          {
            name: "gemini-2.5-pro",
            displayName: "Gemini 2.5 Pro",
            description: "Most capable model for complex tasks",
          },
        ],
      }),
  } as Response)
);

// Mock window.matchMedia for Storybook
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
