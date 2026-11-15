# LAZARUS DEV — The Forest Between Pages

**Live:** https://azrielchoerulhakim.github.io/lazarusdev/

The live root is now the **Stage 03 semantic storybook shell**: accessible, responsive typography and navigation across five mapped chapters. This is the design system / editorial foundation, **not the final illustrated book**. Original crayon forest assets, the Paperkeeper model bible, layered scenes, narrative animations and working project enquiry remain reserved for later stages.

## Design authority

- \`docs/forest/ART-DIRECTION-LOCK.md\` — approved Master Design V2 identity, colors and no-generic constraint.
- \`docs/forest/01-content-map.md\` — five chapters and transparent concept-project claims.
- \`docs/forest/03-design-system.md\` — Stage 03 UI tokens, responsive behavior, a11y audit, limitations.
- \`src/storybook/styles/tokens.css\` — V2 core palette, type stack, global accessible controls.
- \`src/storybook/styles/chapters.css\` — distinct editorial compositions of Entrance, Winding Path, Work Clearing, River Stories, and House on the Hill.
- \`src/storybook/main.js\` — content contract, plain-text data sync, mobile nav and current-chapter state.
- \`src/storybook/data/content.js\` — copy source; speculative projects labeled concepts.

The normal GitHub Pages root \`index.html\` and nested \`storybook/index.html\` are equivalent standalone entrances, each using route-correct relative paths.

## Commands

\`\`\`bash
npm install
npm run dev
npm run build
npm run preview
npm run build:storybook
npm run preview:storybook
\`\`\`

## Quality gate

\`.github/workflows/forest-scaffold.yml\` builds both routes, verifies the legacy 3D stack is absent, runs Playwright across 320, 375, 390, 430, 768, 1024, 1440 and 844x390 short-landscape sizes, tests nav/focus/anchors/details/contrast/touch target and reduced motion, captures desktop/mobile screenshots and uploads the artifacts.

**No claim of final art-direction approval:** stage 04+ must create independent original illustration assets rather than fake SVG mascots, stock graphics, general noise overlays or crops from the master image. A full production accessibility and performance audit remains for stage 15/16.

The former 3D project is not in the active code tree. Its historical source is retained separately on \`archive/3d-pre-storybook-2026-11-15\`, not included in the deployed site.
