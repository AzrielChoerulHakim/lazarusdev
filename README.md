# LAZARUS DEV — The Forest Between Pages

The **main website** has been replaced with the existing Stage 02 forest-storybook foundation at the repository root.

**Live:** https://azrielchoerulhakim.github.io/lazarusdev/

**Current state:** this is an engineering/content foundation, **not** the approved finished illustrated master, a finished interactive five-chapter website, or a Stage 03 implementation. The original crayon layers, Paperkeeper and chapter interactions remain future work. No generic AI forest assets have been introduced as placeholders.

## Active source tree

- \`index.html\`: currently published root entry page.
- \`src/storybook/main.js\`: mounts the five chapters' names from Stage 01 narrative data.
- \`src/storybook/data/content.js\`: established content contract for the future chapters.
- \`src/storybook/styles/scaffold.css\`: temporary, namespaced Stage 02 readable foundation.
- \`storybook/index.html\`: same scaffold at a secondary nested URL.
- \`vite.config.js\`: relative-base production build, suitable for deployment to \`/lazarusdev/\`.
- \`vite.storybook.config.js\`: optional dedicated standalone Stage 02 artifact.
- \`docs/forest/ART-DIRECTION-LOCK.md\`: binding Master Design V2 and anti-generic requirements.
- \`docs/forest/01-content-map.md\`: editorial/narrative reference.
- \`docs/forest/02-root-replacement.md\`: migration, deleted legacy systems, validation and rollback.

## Commands

\`\`\`bash
npm install
npm run dev
npm run build
npm run preview
npm run build:storybook
npm run preview:storybook
\`\`\`

No Three.js/WebGL runtime or 3D asset dependency remains in the **active source tree**.

## Important boundaries

This migration does NOT implement Stage 03 (visual design system), Stage 04 (artwork), Stage 05 (Paperkeeper bible) or later immersive chapters. The production site **currently shows a plainly labeled Stage 02 foundation**. New content should not falsely present studio concepts as completed client work. Contact submissions and journal publication are not implemented.

## Recovery

For disaster recovery only, the prior 3D experience remains accessible on the isolated historical ref:
\`archive/3d-pre-storybook-2026-11-15\` at \`e5edde4d2b1b5a0345432cc8e472905b1364e9d4\`.

This archived history is separate from the new live \`main\` tree; its code is **not loaded** by the current website.
