# Lazarus Dev V3 — Narrative Reconstruction / Execution Ledger

**Date:** 22 November 2026
**Branch:** main, as explicitly directed by the project owner.
**Art direction:** The Forest Between Pages: tactile 2D crayon illustrations, Paperkeeper and original assets; Halfmile-inspired temporal storytelling without cloning its appearance.
**Status:** V3.0–V3.4 source implementation committed. Automated GitHub Actions is engineering evidence, not human art sign-off.

## Implemented in stages

| Stage | Actual output |
| --- | --- |
| V3.0 / Foundation | Pure scene progress math, shared scene director; retains independent event-led character acting |
| V3.1 / Entrance | On large viewports, sticky illustrated stage, controlled camera, lantern light, Paperkeeper and editorial typography |
| V3.2 / Journey | Path camera, Clearing background and an original SVG pencil trail drawn across the four between-chapter seams |
| V3.3 / Resolution | River camera supporting the existing paper rescue and a House dusk curve preserving the visitor's own window-light toggle |
| V3.4 / Refinement | Narrow/short viewport handling, reduced motion, no-JS fallback, source invariants, dual-route browser checks, Chromium PNG capture |

## Technical contract

1. Original semantic source stays in the two production HTML files. Five chapter IDs, authored copy, Field Atlas, Atrium, truthful concept labeling and Field Letter stay intact.
2. V3 coordinates the camera, scenery, notes and chapter progress; legacy modules continue to own poses, controls and finite events.
3. Native anchors and scroll remain available. No wheel interception, forced scrolling, scroll locks, or fabricated form submissions.
4. Entrance, Path and River use selective sticky stages only when viewport conditions allow. Narrow phones (at most 670px), short screens (at most 650px high), reduced-motion and disabled JS use normal page flow.
5. Decorative annotations and reading marker are pointer-transparent and hidden from assistive technology; text and actions remain authored HTML.
6. Scroll changes are batched to one animation frame. Media-preference changes are handled without reload.
7. No claim of replacing painterly sources, drawing new originals, implementing contact delivery, or passing a real physical phone test.

## Source inventory

- src/storybook/narrative-math.js — pure progress/phase math.
- src/storybook/narrative-director.js — scene registration, painting camera, authored pencil-seam trace.
- src/storybook/styles/narrative-v3.css — consolidated final narrative styling.
- scripts/forest_v3_smoke.mjs — source integrity and native-scroll invariants.
- scripts/forest_v3_browser.mjs — 16 real browser states and no-JavaScript reading, plus screenshot evidence.
- .github/workflows/lazarus-v3.yml — builds both routes and executes source/Chromium checks.

## Commands

npm install
npm run check:v3
npm run build
npm run build:storybook

For a complete browser check, execute the V3 GitHub Actions workflow; it installs Playwright, hosts the two build outputs under a Pages-shaped URL, then runs npm run check:v3:browser.

## Art review and remaining limitations

Passing CI is not proof of beautiful art direction. The V3 workflow uploads genuine rendered PNGs for visual inspection. Human review of pacing, illustration continuity, mobile typography, gesture legibility and actual smartphone interaction remains a separate final acceptance gate. Historical CSS layers stay intact until render-based signoff allows safe consolidation; the V3-specific composition is isolated to one final CSS layer instead of multiplying patch files.
