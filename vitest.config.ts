import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    env: {
      NODE_ENV: "development",
    },
    projects: [
      // Unit tests project
      {
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.resolve(dirname, "./src"),
          },
        },
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
          exclude: ["**/node_modules/**", "**/dist/**"],
          env: {
            NODE_ENV: "development",
          },
        },
      },
      // Integration tests project
      {
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.resolve(dirname, "./src"),
          },
        },
        test: {
          name: "integration",
          globals: true,
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: ["tests/integration/**/*.spec.ts"],
          exclude: ["**/node_modules/**", "**/dist/**"],
          env: {
            NODE_ENV: "development",
          },
        },
      },
      // Storybook Vitest project intentionally disabled while Playwright/browser support is offline.
      // Reintroduce by reinstating the project block with storybookTest(...) when Playwright returns.
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
