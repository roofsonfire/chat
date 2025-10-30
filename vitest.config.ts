import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
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
      // Storybook tests project
      {
        plugins: [
          react(),
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          globals: true,
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          exclude: ["**/node_modules/**", "**/dist/**"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
