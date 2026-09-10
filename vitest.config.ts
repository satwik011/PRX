import { defineConfig } from 'vitest/config';

// Domain functions are pure TypeScript with no React Native imports, so they
// run under plain Node — no Metro transform, no jest-expo, sub-second runs.
export default defineConfig({
  test: {
    include: ['src/lib/domain/**/*.test.ts'],
    environment: 'node',
    // Domain tests are pure and share no state, so workers can be reused.
    isolate: false,
  },
});
