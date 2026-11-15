# Stage 07 — Winding Path: the route through roots

**Studio:** Lazarus Dev / *The Forest Between Pages*  
**Master:** V2 board (`master-board-v2.png`) and design-system rules  
**Scope:** Chapter 02 / Winding Path only. Winding trail, root bridge, layered woodland, editorial process, passive pencil tracing.

## Concept and distinct composition

The Entrance is a threshold; **Winding Path is a journey**. Instead of repeating the previous hero layout, this chapter is a full-width illustrated **field map spread** between the real heading and the existing practice/service narrative. A tangled giant root, warm S-shaped earthen road, naturally bent wooden root bridge, pine-mist background and small wildflowers establish direction. The previously introduced Paperkeeper and moth appear as *separate reusable image assets*, not as an improvised human traveler or newly redrawn mascot. The art has no rasterized typography, UI elements or signs carrying misleading promises.

The real service list remains in semantic HTML: **Creative development, Digital products, Immersive experiences, Independent experiments**. The note “Discover / Define / Make / Refine” remains explicitly **a possible working rhythm**, not a claim that the studio always follows a certified process. The native `#work-clearing` navigation remains direct and usable if scripts/assets do not load. Nothing in Work Clearing / River Stories / House on the Hill is implemented by this stage.

## Source / provenance / export identity

This chapter uses a **new, original AI-assisted digital colored-pencil/crayon illustration** generated specifically for Lazarus Dev on 2026-11-15; it is not an image cropped from the owner-approved V2 composite and should never be described as physically hand-painted. Its directional pencil hatching, mossy roots and warm path colors were deliberately selected against the V2 Chapter 02 thumbnail. Photoshop stock, procedural vector forests, glossy cards, and random new animal mascots are rejected.

- `storybook/assets/winding-path/source/winding-path-crayon-source.webp` — source painting (1536×1024), preserved as a high-quality WebP.
- `storybook/assets/winding-path/exports/winding-path-desktop.webp` — independent image file for wide layouts (1536×1024).
- `storybook/assets/winding-path/exports/winding-path-mobile.webp` — **768×1248 portrait recomposition**: a continuous curving scanline remap that tracks the path from foreground to distance instead of taking a static central crop. **Honest caveat:** this is derived from the purpose-made desktop art, not a second independently painted source. Fully independent portrait art remains a Stage14 review requirement.
- `storybook/assets/winding-path/manifest.json` — recorded SHA256, byte sizes, exact dimensions, assets' derivation and unambiguous attribution.
- `scripts/forest_path_export.py` — deterministic original-to-export recipe using Pillow/NumPy/OpenCV; no extraction from the master board.
- Reused independent character files: `storybook/assets/characters/paperkeeper.three-quarter.webp` and `storybook/assets/characters/moth.guide.webp`.

## Limited interactive path drawing (native-scroll friendly)

`src/storybook/path.js` listens to the **passive** `scroll` and `resize` events, computes the visible position of the Winding Path scene, and reveals one organic pencil track. It **never** calls `preventDefault`, sets `overflow:hidden` on the page, intercepts wheel/touch, scrolls the user programmatically or blocks navigation. The independently optional “Reveal the whole route” button displays the remaining line instantly, permits restoring native tracing, updates `aria-pressed` and a polite status, and is hidden if JavaScript is disabled. The story and service links stay in normal HTML.

Each platform has its own route path annotation following its composition. Under `prefers-reduced-motion:reduce`, the stroke is immediately fully visible without animation. No Paperkeeper sprite animation or site-wide scrollytelling engine is introduced (those are Stages 11 and 12).

## Quality and scope

The browser test `scripts/forest_path_smoke.mjs` verifies the built GitHub Pages root **and** `/storybook/` on **320, 375, 390, 430, 768, 1024, 1440** and **844×390** profiles, covering asset decode, correct responsive source, no overflow, scroll availability, 44px controls, semantic anchor links, hero/scene separation, working trace/reduced-motion, and image-blocked fallback. `scripts/forest_path_audit.py` verifies file SHA256, exact dimensions, the original source manifest and content integrity. These are **functional** gates, not automated claims of anti-generic design quality or final accessibility certification.

**No screenshot capture or upload**: QA checks browser DOM geometry and functional behavior, in accordance with current user instruction. Existing Stage03 and Stage06 screenshot generation are disabled as part of this checkpoint; those regression checks still run.

**Editorial decision:** the purpose-created colored-pencil path and root bridge match the principal Stage07 visual motifs in Master V2, and Chapter 02 has a distinct visual storytelling role from Chapter 01. Environmental depth remains part of the single original painting, with Paperkeeper and moth separate; do not call it full multilayer parallax. The independent mobile painting and global chapter-to-chapter art polish remain honestly deferred to the relevant later stages (especially 14 and 17). No fabricated numerical art-review scores are assigned.

**Release condition:** Stage07 CI plus Stage03/06 regression and GitHub Pages deployment must pass on the exact release SHA. Stage08 may start only after a new request.