# Root-site replacement — Stage 02 foundation only

**Date:** 2026-11-15 (Asia/Jakarta)
**User instruction:** remove the previous 3D website entirely from the current active website; replace it with the planned storybook project; **do not start Stage 03**.
**Release target:** main, GitHub Pages /lazarusdev/.
**Prior public 3D baseline:** e5edde4d2b1b5a0345432cc8e472905b1364e9d4

## What has been replaced

- Root \`index.html\` is now the already-built Stage 02 storybook scaffold.
- Source tree \`src/\` now contains **only** \`src/storybook/\` (bootstrap, data, temporary scoped CSS).
- Removed active Three.js WebGL runtime, procedural architecture, liquefied gateway, statue and portal modules, photographic sky, shader helpers, legacy CSS and JS.
- Removed \`assets/\` tree (GLB bust, HDRI, photographic stone textures, moon maps).
- Removed WebGL-specific installer workflows, visual QA screenshot publication, legacy WebGL tests, asset-downloader Python scripts and legacy favicon.
- Removed Three.js dependency from package.json; Vite only.
- Removed 3D baseline screenshots from the active branch; the archived historical branch retains the former site's source.

## What is live now and what is NOT live yet

- A lightweight foundation document with accessible static headings and exactly five Stage 01 chapter names.
- \`src/storybook/main.js\` loads the content module; its contract checks the ordered five chapters.
- Scope matches completed Stage 02. This is **NOT** an illustrated storybook website yet. Original crayon world layers, character designs, animation and chapter sections are future stages and have NOT been silently implemented.
- The wordmark and temporary CSS are engineering scaffolding, not an assertion that Master Design V2 is fully realized.
- Existing concept work is not misrepresented as client commissions; no invented contact endpoints are introduced.

## Production delivery and QA

- Normal \`npm run build\` compiles root entry with \`vite.config.js\` base \`./\`.
- \`npm run build:storybook\` builds the optional nested \`storybook/\` entry.
- \`.github/workflows/forest-scaffold.yml\` runs for pushes to \`main\` or \`feature/forest-storybook\`: rejects legacy files/dependencies, builds both entries, serves them in a local Pages-shaped \`/lazarusdev/\` directory, runs Playwright mobile and desktop checks and publishes screenshots to workflow artifacts.
- Actual public Pages deployment and live URL must be verified from GitHub Actions after promotion to \`main\`. A passing simulator alone does not prove public deployment.

## Recovery note, not live code

The historical 3D implementation is retained only as \`archive/3d-pre-storybook-2026-11-15\` (baseline commit) to allow recovery. It is absent from the active \`main\` HEAD and its build. Git history is not rewritten. Revert/redeploy through a reviewed commit if recovery is ever required.

## Strict stage boundary

**Stop after replacement and validation. Do NOT implement Stage 03 yet.** No illustration authoring, no design system release, no chapter animation.
