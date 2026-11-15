# Locked art direction — The Forest Between Pages V2
**Locked on:** 2026-11-15. **Applies to all forest-storybook work only.** This is the approved master, not a replacement for the 3D site's design.

## Source-of-truth files and integrity
Original task attachments, not yet converted into production artwork:
- `forest-between-pages-master-v2/master-board-v2.png` — SHA-256 `e6bd07a35e3a79b7cca5e2832b301aa2a2cbb13af46942eb2c95460358f85403`
- `forest-between-pages-master-v2/DESIGN-SYSTEM.md` — SHA-256 `2ae1d6cdacee9cf85c04faa80dbde7c41b29cd3438c874c43868c5655d872f1d`
- `forest-between-pages-master-v2/ART-DIRECTION-AUDIT.md` — SHA-256 `e99a48df40f67e4c3eb02929267902a5d64d603386ec5f6c5c678d90222b6163`

**Important:** These hashes identify the user-approved exact visual master; this repository currently stores the *lock specification* but not the original flattened binary masterboard. Do not claim the PNG is already a production-ready set of layers; arrange independent illustration source assets at Stage 04. If any proposed artwork diverges from the approved master, reject it and revise it.

## Non-negotiable visual rules
1. 2D crayon/colored pencil illustration on tactile paper. Directional hatching, pressure variation, hand-drawn edges, organic imperfections. Never substitute smooth vector mascots, generic stock illustration, arbitrary noise-overlay UI or fake crayon filters.
2. Distinctive protagonist **Paperkeeper**: asymmetric leaf hat; layered leaf/moss cape; twig-like legs; paper messenger satchel; acorn lantern. A moth serves as wayfinding and a roundbird as limited supporting character. No chibi AI mascot, no giant-eye character redesign.
3. One consistent illustrated world across FIVE different scenes. Keep perspective intentionally naive but legible; each chapter has a different narrative composition, not repeated hero/card grids.
4. Illustration must carry semantic purpose and never bury essential text, links, buttons or navigation. Genuine HTML headings and interactions stay accessible.
5. Handmade artwork must be authored as *independent usable assets* for desktop/mobile, not cropped from this flattened moodboard. Track source/provenance of every asset.

## Core palette (interface tokens)
- Forest `#244F3B` — primary text on paper, primary button
- Ink `#273829` — reading text
- Paper `#F7E9D6` — reading surfaces
- River `#5A8CAF`, Sun `#F3C354`, Clay `#D86A4A`, Berry `#8B6CA8` — decorative accents/illustration; **not small reading text on paper**

Typography: distinctive hand-drawn/editorial serif display with semantic heading fallback; Newsreader-like readable book serif for paragraphs; simple accessible UI labels. No default startup-system UI pretending to be a storybook.

## Canonical chapter structure
1. **Entrance** — forest arch and Paperkeeper; introductory message and direct CTA
2. **Winding Path** — path through roots and moss; process / way of working
3. **Work Clearing** — hanging handmade project sheets; real work or clearly labeled concepts
4. **River Stories** — water, stones, page motifs; journal, experiments, reflections
5. **House on the Hill** — cottage, studio story, manifesto and genuine contact route

Scroll is native. Navigation by chapter anchors and immediate skip paths is mandatory. Motion only when meaningful; Paperkeeper limited drawn motion ~8–12 fps (when later implemented); `prefers-reduced-motion` must show a usable static scene.

## Usability and quality gate
Apple Human Interface Guidelines serve as **quality discipline for clarity, user agency, craft and restrained delight**, not as Apple's visual identity or a certification. Target WCAG 2.2 AA: normal text contrast >= 4.5:1, large text >=3:1; keyboard and visible focus; accessible labels; touch target design >=44 x 44 CSS px; mobile art-directed composition, not merely a crop; no horizontal overflow.
Editorial anti-generic rubric: silhouette, stroke provenance, character consistency, composition diversity, purposeful motion, asset integrity, typography, UX harmony. Every criterion >=4/5 AND mean >=4.5/5 before chapter sign-off; scores require human inspection, not a claimed automated aesthetic test.

**Approval boundary:** no change to `main`, the currently live 3D website or its source until the staged release and explicit go-ahead. Follow the 19-stage execution roadmap; isolate art, implementation and audit work.
