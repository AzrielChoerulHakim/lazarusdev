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

The source of truth for illustration identity is `docs/forest/ART-DIRECTION-LOCK.md`. Production HTML is `index.html` and `storybook/index.html`; chapter visuals are in `storybook/assets/`, and behavior/styles live in `src/storybook/`. The pipeline includes automated, **text-only** browser QA across chapter invariants, keyboard, screen-reader semantics via axe, viewport constraints, motion policy, asset and performance budgets, and launch metadata. **No browser screenshots or videos are automatically captured or uploaded.**

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
