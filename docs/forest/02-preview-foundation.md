# 02 — Preview scaffold and build plumbing

**Date:** 2026-11-15 (Asia/Jakarta)  
**Scope:** Stage 02 only.  
**Primary branch:** \`feature/forest-storybook\`  
**Legacy reference:** \`main@e5edde4d2b1b5a0345432cc8e472905b1364e9d4\`

## Added, not replaced

- \`storybook/index.html\`: standalone human-readable scaffold page, NO final design.
- \`src/storybook/main.js\`: isolated ESM bootstrap importing Stage 01's \`data/content.js\` with strict five-chapter contract.
- \`src/storybook/styles/scaffold.css\`: temporary CSS scoped to \`.storybook-scaffold\`. Does not import or modify \`src/styles.css\` or any 3D modules.
- \`storybook/assets/README.md\`: artwork embargo and subsequent stage boundaries.
- \`vite.storybook.config.js\`: Vite config generating \`dist-storybook/storybook/index.html\` plus relative bundled assets.
- \`scripts/storybook-smoke.mjs\`: Playwright desktop/mobile verification and screenshots.
- \`.github/workflows/forest-scaffold.yml\`: branch-isolated CI checking legacy Vite build, separate storybook build, actual legacy WebGL smoke, and nested-path storybook smoke.
- \`package.json\`: adds storybook-specific commands; leaves \`dev\`, \`build\`, \`preview\`, and existing package versions unchanged.
- \`.gitignore\`: excludes output folder \`dist-storybook/\`.

## Local commands

\`\`\`bash
npm install
npm run dev                 # legacy root remains http://localhost:5173/
# independent Stage 02 page: http://localhost:5173/storybook/
npm run build               # unchanged 3D dist/
npm run build:storybook     # independent dist-storybook/ artifact
npm run preview:storybook   # independent built preview, typically /storybook/
\`\`\`

## Preview constraints

The **deployed** storybook path is NOT activated in this stage. User-approved live 3D site stays on GitHub Pages \`main\`. GitHub's connected settings API cannot verify the Pages source branch/folder; Stage 00 records this gap. Therefore we use a safe, non-public build artifact:
1. CI builds storybook independently.
2. It copies output beneath \`/lazarusdev/\` in a temporary HTTP static server.
3. Browser test opens \`/lazarusdev/storybook/\` from that mirror; checks five chapter titles, no 3D canvas, no JS errors, no horizontal overflow.
4. CI captures 1440x900 and 390x844 browser screenshots and uploads the built preview + captures as GitHub Actions artifact \`forest-stage02-preview\`.

This proves the *path and compiled files* work in a GitHub Pages-like directory; it **does not** prove GitHub Pages currently publishes this feature branch. Do not claim a public preview URL.

## QA boundaries

- Unit/content contract: 5 chapter IDs in the approved order, imported via JavaScript module (not duplicated mock data).
- Legacy regression: existing 3D build and existing Playwright WebGL smoke, not replaced or relaxed.
- New regression: standalone storybook build; static nested path and two responsive screenshots.
- Accessibility at this stage: static readable fallback if ESM fails, semantic H1, skip link, no fake CTAs, no images with baked text. Full controls, contrast and audit belong to Stage 03/15.
- Illustration QA: **not applicable**. No production illustration has been created; V2 master rules remain authoritative.

## Boundaries for next stage

Stage 03 owns UI tokens, typography, navigation, focusable controls and actual semantic chapter shell. Stage 04 owns the independent crayon artwork pipeline. This scaffold must not be passed off as either.

**Do not start Stage 03 until the project owner asks for it.**
