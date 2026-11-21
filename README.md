# LAZARUS DEV — The Forest Between Pages

**Website:** https://azrielchoerulhakim.github.io/lazarusdev/

Lazarus Dev is an independent creative development and digital product studio. This live website is a five-chapter, illustrated editorial field book — not a template-based portfolio or a verified list of commissioned client projects.

## The book

1. **Entrance:** an illustrated gateway, the Paperkeeper character, and a fold-out Field Atlas.
2. **Winding Path:** the studio's creative development practice and a visitor-controlled pencil trail.
3. **Work Clearing:** three explicitly labeled *concept explorations* and a real, inspectable specimen of this website's own design decisions.
4. **River Stories:** unpublished field-note outlines; no fabricated published articles.
5. **House on the Hill:** studio manifesto, intentional window-light interaction and a local-only Field Letter editor.

Every route keeps semantic HTML, native chapter anchors, keyboard controls, `prefers-reduced-motion`, and no-JavaScript reading fallbacks. The root and legacy `/storybook/` URLs serve the same narrative; **only the root is canonical and indexable**. The sitemap contains that root URL only.

## Installation and checks

```bash
npm install
npm run dev
npm run build
npm run build:storybook
npm run preview
```

The source of truth for illustration identity is `docs/forest/ART-DIRECTION-LOCK.md`. Production HTML is `index.html` and `storybook/index.html`; chapter visuals are in `storybook/assets/`, and behavior/styles live in `src/storybook/`. The QA pipeline combines source-level gates and real Chromium browser verification across chapter invariants, keyboard accessibility, axe semantics, viewports, motion preferences, asset budgets, and release metadata. The dedicated R13, R15 and V3 workflows capture genuine browser PNGs as GitHub Actions evidence; automated checks do not replace subjective visual art review.

## V3 narrative reconstruction — 22 November 2026

V3 is now integrated directly on main for both published routes. It introduces a single cinematic scene director, authored SVG trail tracing across chapter seams, Entrance camera/lantern progression, progressive path/river scenery, editorial hierarchy and a gradual House dusk composition. It preserves original illustrations, the R15A Paperkeeper poses, the interactive Atrium, native chapter anchors and honest concept-study descriptions.

The cinematic staging is **selective**, not mandatory: narrow mobile and short landscape screens read linearly, and visitors requesting reduced motion or disabling JavaScript keep the entire readable site. Existing character gestures and visitor-controlled light remain separate from the new scenery director.

Run the dedicated V3 source gate using **npm run check:v3**. The **Lazarus V3 - cinematic narrative verification** GitHub Actions workflow builds the two routes, verifies 16 real Chromium states and a no-JS fallback, and uploads rendered screenshots. The full implementation ledger is in docs/forest/V3-NARRATIVE-EXECUTION.md.

**Boundary:** The V3 code and automated checks are not a claim of completed subjective art approval, freshly illustrated replacement art, or a functioning lead-delivery backend.

## Public claims and launch boundaries

- The folio studies are **concepts, not client commissions**. The page itself is a studio-made experiment, not a fabricated client case study.
- **The Field Letter does not send inquiries.** It only assembles a project brief for copying or downloading on the visitor's device. There is no verified studio contact email, telephone, webhook or inbox in this repository. A real delivery channel must be provided, reviewed and integrated before claiming that the site receives leads.
- Illustrated scenes include AI-assisted raster pieces and separately scripted SVG portrait compositions. They are not represented as physically hand-drawn.
- Technical automated QA is **not evidence of final artistic approval**. A human-directed editorial/visual review is still needed, particularly for mobile-versus-desktop art consistency and the user's non-generic standard.
- Public indexing was enabled for the canonical root at Stage 18. Discoverability is not guaranteed; Google Search Console and domain configuration are separate site-owner decisions. The nested duplicate is `noindex,follow`.

## Launch documentation

- `docs/forest/18-launch-readiness.md` — final deployment, indexability, evidence and remaining blockers.
- `docs/forest/17-creative-reconstruction.md` — editorial changes and outstanding aesthetic review.
- `docs/forest/16-performance.md` — measured CI resource budget (not production Core Web Vitals).
- `docs/forest/15-accessibility.md` — accessibility checks and limitations.

The earlier 3D experiment remains in historical Git branches and is not the current production design.

## R01–R09 revision track (17 November 2026)

The current **Forest Between Pages** is built on the full five-chapter Stage18 base and includes a distinct revision track:

- R01 — delegated editorial art direction, material rules and storyboard.
- R02 — newly illustrated desktop/mobile Entrance and independent full-size Paperkeeper reference.
- R03 — nine registered lantern poses, finite 1200ms invitation / 560ms raised-pose acknowledgment.
- R04 — native Field Atlas activation of the R03 motion, lazy decode and reduced-motion/no-JS fallback.
- R05 — four original decorative **marginal engravings**, not a falsely claimed repaint of the four full forest paintings.
- R06 — finite, event-led ink-response layer for the Path, Work, River and House controls; no full-body puppet animation.
- R07 — editorial reflow fixes and readable, source-controlled responsive polish.
- R08 — Chromium integration/QA gate for both production routes plus R04/Stage18 regression.
- R09 — canonical share-art refresh to the R02 Entrance, release verification and promotion to main.

**Art acceptance remains honest:** A complete new pair of separately illustrated desktop/portrait paintings for Chapters 02–05, new anatomically drawn gesture sprites, and subjective human visual signoff have **not** been completed by this revision track. The original chapter paintings remain in production. All concept works remain labeled as concepts, and Field Letter remains local-only because no verified inbox exists. Automated CI does not certify non-generic artistic quality.

The canonical GitHub Pages source is `main`; `/storybook/` is a linked, non-indexed alternate. Revision source material and QA notes are in `docs/forest/revision/`.


## R14–R15 composition and Atrium implementation (18 November 2026)

The later [visual revision roadmap](docs/forest/VISUAL-REVISION-EXECUTION-PLAN.md) builds on the earlier forest-book release without replacing the source paper illustrations.

- **R14:** a ten-scene-frame comparison drawn from real frozen R13 Chromium captures, a machine-readable composition/light/groundline contract, candidate non-destructive tonal grading, and a mobile river safe zone. [R14 evidence](docs/forest/revision/r14/README.md).
- **R15:** The Atrium now enters via a pointed stone/gold threshold following the existing concept poster, with a directional pencil-hatched material treatment, four physically linked scene layers and individually projected left/right pillar shadows. A one-swipe interaction, modal focus/scroll restoration, desktop/portrait/short-landscape layout and both routes have browser tests and rendered evidence. [R15 notes](docs/forest/revision/r15/README.md) · [R15 verified runs](docs/forest/revision/r15/QA-RESULTS.md).
- **Art sign-off remains pending:** scripted SVG pigment does not automatically equal the density of the existing AI-assisted crayon-raster folio. The human blind-thumbnail review, real-phone gesture test, and final authored material approval are not replaced by passing CI. R15A's independent Paperkeeper alpha/pose remediation and R16–R19 remain separate scopes.
