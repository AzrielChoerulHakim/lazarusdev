import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = dirname(fileURLToPath(import.meta.url));

// Retains the Stage 02 alternative /storybook/ artifact after root migration.
// Production uses root index.html and vite.config.js instead.
export default defineConfig({
  root: repoRoot,
  base: './',
  build: {
    outDir: 'dist-storybook',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(repoRoot, 'storybook/index.html'),
    },
  },
});
