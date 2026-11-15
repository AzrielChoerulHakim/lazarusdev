import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Stage 02 independent build: does not override the legacy Vite root build.
 *
 * Input:  storybook/index.html
 * Output: dist-storybook/storybook/index.html + dist-storybook/assets/*
 *
 * Relative asset URLs survive mounting under /lazarusdev/ on a static host.
 * Only the fixture route is validated here; GitHub Pages deployment is NOT
 * reconfigured or assumed to include a feature branch.
 */
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
