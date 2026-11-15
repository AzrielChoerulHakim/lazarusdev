# Stage 08 — The Work Clearing / illustrated folio archive

**Project:** Lazarus Dev — *The Forest Between Pages* (locked Master V2)
**Scope:** Chapter 03 only, after Stage 07 is released. No work on the River, House, animation controller, contact backend or global scrollytelling.

## Concept: three original hanging folios, not three generic cards

The Chapter 03 visual in V2 depicts a **clearing under a forest canopy**, with a rope between weathered wooden posts and handmade paper sheets. The implemented stage uses a purpose-generated original digital colored-pencil **clearing environment**, three separately authored bookplate-style concept drawings, and the **unchanged Stage 05 Paperkeeper** sprite quietly observing the work.

Each irregular page has crayon/pencil linework, an organic paper edge and small wooden peg. Titles/categories are **HTML**, never in the image: The Atrium (experience concept), The Oracle (product exploration), The Archive (editorial exploration). The three sheets refer to three **explicitly hypothetical studio concepts** already recorded in the Stage 03 source; they are **not** real clients, completed projects, public URLs, portfolio case studies, testimonials or commissions.

## Every sheet has an actual meaningful destination

The image is a native `<a href="#folio-atrium">` etc. Clicking it opens an actual `<details>` element with that project's honest conceptual description on the *same page*. The browser hash is a deep link, not a dead "+" decorative action. Without JavaScript, the link still navigates to the visible `<summary>`, which a keyboard or touch user can expand independently. The page titles and descriptions are in accessible HTML, with `aria-label` on the art-sheet links; no text is baked into the raster images.

On desktop all three pages hang against the continuous clearing; differing angles and offsets intentionally prevent a startup-card grid. On phone/tablet they become a **native horizontally scrollable printed field album**, with one sheet at a time rather than three squashed columns. No forced scrolling or scroll lock, no animated carousel JS, and no screenshot capture.

## Art ownership and reproducibility (honest)

The **clearing background** is newly created for Stage 08 through an AI-assisted illustration generation workflow and deliberately chosen to match the locked V2 palette and colored-pencil marks. Original artwork source is kept as `storybook/assets/work-clearing/source/work-clearing-source.webp`, not cut from the approved flattened master V2 PNG. It includes an empty rope line and sunlit green clearing, intentionally providing real negative space for separate art-sheet cutouts.

The three **folio illustrations** are independent digital illustrations authored in `scripts/forest_work_illustrations.py` using purpose-specific architectural/celestial/library geometry and textured pencil hatching. Their pigment texture high-pass is derived **only** from the new Stage 08 clearing artwork to keep the material palette cohesive; not a flattened UI screenshot, stock illustration or slice of the master V2. They are digital procedural/AI-assisted art, **not** claimed to be manually hand-drawn physical artwork. No new third-party photos or copyrighted brand graphics were imported.

The image source, outputs, byte sizes, SHA256 and opacity live in `storybook/assets/work-clearing/manifest.json`. Re-running `python scripts/forest_work_illustrations.py --source storybook/assets/work-clearing/source/work-clearing-source.webp --output <new directory>` reproduces exported art and the rendering recipe. The archived source is the compressed generated painting, not the original model-side PNG; individual folio drawings are generated from authored source code.

## Technical and scope gates

- Three unique art files + one original background, all optimized WebP, with explicitly documented sizes and source.
- The previously written concept names and descriptions remain unchanged in both compiled routes. Chapter sections and global navigation remain intact.
- The shell supports actual click and keyboard navigation, `details.open`, URL fragment deep links, and no-JavaScript/no-image fallback. No empty outbound project URLs were invented.
- Reduced motion stops hover movement; all scroll remains native.
- Real-browser testing covers 320, 375, 390, 430, 768, 1024, 1440 widths plus 844×390, for both GitHub Pages routes, and verifies images, semantics, links, readability geometry, no horizontal document overflow, and accessibility target size.
- **Do not create, capture, store or send browser screenshots** for Stage 08 and regressions. QA artifact contains only text logs and manifest.
- Independent portrait background artwork is not claimed; Chapter 03 mobile interaction has its own layout/composition but the forest background is responsively cropped. Stage 14 remains the mobile-native art review.
- Human editorial judgment remains necessary for the final Master V2 anti-generic rubric at Stage 17; CI cannot certify art originality with a numeric score.

**Stage 08 release condition:** Stage 08 QA plus Stage 03, 06, 07 regressions pass and Pages builds/deploys on the exact `main` commit. Do not start Stage 09 before separate authorization.