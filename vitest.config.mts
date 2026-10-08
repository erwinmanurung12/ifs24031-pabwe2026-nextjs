import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // @ts-expect-error - type mismatch versi vite/vitest
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(rootDir, "./src") } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      all: true,
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "node_modules/**",
        "src/__tests__/**",
        "src/app/**",
        "src/components/Providers.tsx",
        "src/setupTests.ts",
        "src/lib/config.ts",
        "src/types/**",
        "src/hooks/redux.ts",
        "src/server.ts",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        ".next/**",
      ],
    },
  },
});