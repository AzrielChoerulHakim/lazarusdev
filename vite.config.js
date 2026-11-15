import { defineConfig } from 'vite';

// GitHub Pages serves this repository under /lazarusdev/.
// Relative asset references work in that subdirectory and in local preview.
// Not a Stage 03 visual implementation.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
