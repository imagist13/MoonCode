import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // 以当前基线为准的"防倒退"阈值（2026-11 实测：74.1/70.85/67.5/76.34），
      // 不是最终目标。补测试后请逐步上调，最终目标 80%。
      thresholds: {
        branches: 65,
        functions: 65,
        lines: 70,
        statements: 70,
      },
      exclude: [
        "node_modules/",
        "test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/page.tsx",
        "**/layout.tsx",
        "**/error.tsx",
        "**/_not-found/**",
      ],
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
