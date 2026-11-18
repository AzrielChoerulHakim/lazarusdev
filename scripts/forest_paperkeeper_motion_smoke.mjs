// Exercise the shared journey assertions across the full Stage 11 device matrix.
process.env.FOREST_ALL_VIEWPORTS = '1';
await import('./forest_r11_smoke.mjs');
