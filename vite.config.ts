import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(here, './src'),
      '@components': path.resolve(here, './src/components'),
      '@contexts': path.resolve(here, './src/contexts'),
      '@pages': path.resolve(here, './src/pages'),
      '@services': path.resolve(here, './src/services'),
      '@config': path.resolve(here, './src/config'),
      '@utils': path.resolve(here, './src/utils'),
      '@hooks': path.resolve(here, './src/hooks'),
      '@types': path.resolve(here, './src/types'),
    },
  },
});
