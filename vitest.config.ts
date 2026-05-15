import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
      // Rules tests run against the emulator via npm run test:rules and use
      // their own config; keep them out of the default Vitest run.
      exclude: ['node_modules', 'dist', 'tests/rules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx,js,jsx}'],
        exclude: [
          'src/**/*.test.*',
          'src/**/*.spec.*',
          'src/vite-env.d.ts',
          'src/types/**',
        ],
      },
    },
  }),
);
