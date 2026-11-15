# Stage 06 — Entrance: the first illustrated threshold

**Project:** Lazarus Dev — *The Forest Between Pages*  
**Master:** approved Forest V2 board and DESIGN-SYSTEM.md  
**Scope:** Chapter 01 only. Gate environment, responsive composition, static Paperkeeper placement, live hero content and a single interactive leaf cue.  
**Date:** 2026-11-15 (Asia/Jakarta).

## Hero intent

The gateway opens a path into the studio's world. An intentionally open, gently pigmented **left-hand paper field** holds real HTML copy, H1, and two honest anchor actions. The ivy-grown limestone arch and oak crown occupy the right; the path literally leads toward the next chapter. Paperkeeper, sourced unchanged from the Stage 05 three-quarter turnaround, stands beside the threshold holding the acorn lantern. A single leaf link points to Approach. The illustration serves the narrative rather than substituting for navigable content.

No human explorer, fake product/client work, stock vector objects, random external mascots, or text baked into raster images.

## Independent files and provenance

Source illustrations created with ImageGen for this project; they are original **AI-assisted digital crayon/colored-pencil paintings** and must not be described as physically hand-painted or attributed to a real illustrator. They are *not* crops from the user-approved flattened V2 board. They are production illustrations for this specific chapter, rather than the Stage 04 procedural forest test.

- `storybook/assets/entrance/source/entrance-gate-art-source.webp` — original gateway digital painting with intentionally left-side text well.
- `storybook/assets/entrance/source/entrance-portrait-art-source.webp` — separately generated ORIGINAL portrait illustration, purpose-composed for mobile; not a crop, stitched source or mockup.
- `scripts/forest_entrance_export.py` — export recipe; original desktop scene plus an **independently illustrated portrait** with a distinct text field and lower forest gateway.
- `storybook/assets/entrance/exports/entrance-desktop.webp` — 1536 × 1024, purpose-composed desktop scene; opaque image (approx. 320KB).
- `storybook/assets/entrance/exports/entrance-mobile.webp` — 768 × 1320, separate original portrait illustration with a calm upper reading zone and gateway lower on canvas; opaque image (approx. 214KB).
- `storybook/assets/entrance/exports/entrance-leaf-cue.webp` — separately authored directional pencil leaf RGBA cutout (about 6KB), distinct from the gateway art, used exclusively by an HTML anchor.
- `storybook/assets/characters/paperkeeper.three-quarter.webp` — **unchanged** transparent Stage 05 approved reference; never duplicate a new mascot.
- `storybook/assets/entrance/manifest.json` — SHA256 bytes, output sizes, transparency, original source provenance, and weights.

This is independent **environment/background art + protagonist cutout + interactive prop**. It is not a fake extraction of depth layers from a moodboard. The physical desktop scene is a background layer, not a full parallax-scene kit; true additional independently drawn depth sheets and multi-frame animation remain deferred to later stages.

## Frontend integration

- `index.html` and `storybook/index.html` retain **five semantic chapter anchors, one HTML H1**, all existing approved copy, direct `Explore the work` / `Follow the path` links, and the native chapter navigation.
- The placeholder `art-reserve-entrance` figure is replaced by a real `<picture>` with a breakpoint-matched `<source>` for the portrait image and an independently positioned Paperkeeper `<img>` with meaningful alt text.
- The primary CTA and other links are independent of visual assets, operate when images are blocked, and do not require animation or JavaScript.
- `src/storybook/styles/entrance.css` overrides only Chapter 01; other chapters remain exactly at the Stage 03 editorial shell.
- A single intentionally irregular leaf becomes an accessible link to `#winding-path`. It tilts slightly on hover/focus, has a 52–58 CSS pixel target, and becomes static under `prefers-reduced-motion:reduce`. No looping characters, auto parallax, scroll hijacking, forced journey or input interception.
- Source images remain *out* of important text/button hit-testing; the illustration canvas has `pointer-events:none`.
- The main page remains `noindex,nofollow` until verified contact and full chapter launch; no false SEO/production-ready claim.

## Quality gates

**Automated:** `scripts/forest_entrance_audit.py` validates original source/exports and manifesto SHA-256, complete file presence, mobile vs desktop dimensions, file size budgets, Stage 05 character identity and HTML semantics. `scripts/forest_entrance_smoke.mjs` serves actual Vite builds at `/lazarusdev/` and `/lazarusdev/storybook/` and exercises 8 profiles: 320×720, 375×812, 390×844, 430×932, 768×860, 1024×768, 1440×900, 844×390. It checks decoded assets / correct `picture` breakpoint, character identity, real CTA/leaf links, 44px touch targets, zero horizontal overflow, one H1 / five chapters, no character/text collision, image-blocked CTA fallback, reduced motion, and screenshots. Stage 03 regression remains independently required.

**Editorial inspection (not machine-scored):** compare against master V2 manually, including crayon pressure and directional pencil marks, portal silhouette, figure continuity, mobile layout at 320–430, accessibility, text over the genuinely quiet paper field, and absence of AI-generic cards/vectors. The production background and character have different source histories. Any color/line inconsistencies or pixel cutout halos must be corrected before overall scene sign-off. Do not invent a 4.5/5 human score without an actual review.

## Known boundaries

- **Full multi-plane depth** (distant/near architecture separated into independently redrawn planes) isn't produced by cutting this painting. Future deliberate motion is a separate stage; no claims of full parallax here.
- Character cutout Stage 05 has slightly oversized boots and is a reference that may need subsequent art polishing.
- The portrait artwork is created independently as a portrait painting, a separate original single painting, with a quiet upper paper field; no collage seam.
- Stage 07 onwards—Winding Path environment, works folios, river, cottage, character animation, page-wide scrolling engine, and contact backend—are **not implemented** as part of Stage 06.

## Decisions after tests

Technical proof of responsive illustration, assets and HTML usability is an engineering gate. The V2 artistic gate remains subjective and must be reported separately, not fabricated from screenshot automation. Screenshots from Actions are for inspection and reproducibility.

## Editorial disposition

The actual rendered artwork is unique digital colored-pencil art, not a generic CSS/vector substitute. The independent background painting, Paperkeeper cutout and foreground leaf afford a real three-asset composition (two environmental planes are **not** claimed). Creative approval against the exact V2 master still requires human review of screenshots. 