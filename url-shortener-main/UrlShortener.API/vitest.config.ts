import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',            // backend code runs in Node, not a browser
    include: ['src/**/*.test.ts'],  // any file ending in .test.ts is a test
  },
});
