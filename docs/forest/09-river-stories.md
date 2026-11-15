# Stage 09 — River Stories / The notes in the current

**Project:** Lazarus Dev — *The Forest Between Pages*
**Art direction:** user-approved Master V2; Chapter 04 only, after Stage 08 release.
**Scope:** River, rocks, paper motifs, notes / experiments / reflections. Stage 10 House on the Hill is out of scope.

## Creative decision

The river is not another Entrance hero, an interface dashboard, or a generic three-card blog feed. A single wide colored-pencil creek painting is staged between a large editorial heading and two irregular, deckle-edged journal pages. Willow branches frame a stone-filled stream, while an existing approved roundbird sprite occupies the riverbank. A tiny field-map caption and two paper-and-pebble directional tags provide meaningful anchors to the two drafts. Motion is restrained to user-initiated hover and native details opening; no scroll hijack, looping animations or canvas effects.

The scene is purpose-generated digital colored pencil/crayon illustration and is **AI-assisted**, not a photograph or proof of a physically hand-rendered painting. Image generation also produced rejected mockups with **human travelers, raster headings and false publication titles**; these were deliberately not used. The production river scene has no rasterized HTML, headings or claims.

Assets: `storybook/assets/river-stories/manifest.json` tracks original compressed source + desktop/portrait exports. The desktop is an optimized standalone WebP. The mobile source is an intentional 768×1024 crop following the brook and willow, **not** independently painted. That limitation is recorded for Stage 14; mobile functionality and composition are separately tuned by CSS now.

## Truthful journal treatment

All existing canonical content is preserved exactly:
- What happens between the lines.
- Behind the finished image are sketches, wrong turns, experiments, and better questions.
- Building the impossible portal — Thoughts on the studio's earlier three-dimensional website experiment.
- Material makes the mood — How surface, light, and atmosphere change the feeling of a digital space.
- These are editorial outlines. No article is available to read yet.

These are **draft outlines**, never real published articles. Each HTML `details` contains only questions for a *possible future essay*, not fabricated historical observations, an invented reading time, date, author or article URL. Native summaries work by keyboard, touch, and no-JS fallback. The two paper marker links are actual `#river-note-a` and `#river-note-b` anchors; lightweight enhancement opens the corresponding details immediately, preserving genuine browser fragment navigation. No fake publications or external destinations.

## Technical acceptance

- Source/desktop/mobile river art validated with SHA256, decoded dimensions and bytes against an auditable manifest.
- Two semantic GitHub Pages routes preserve all five chapters, canonical heading/lead, one H1, and real journal descriptions/status.
- Accessibility regression: native summary, keyboard Enter, descriptive links, image and script failure fallback, `prefers-reduced-motion`, touch targets 44px, no horizontal overflow at 320, 375, 390, 430, 768, 1024, 1440 and short 844×390.
- The QA workflow **must never capture or upload screenshots**; only text logs and asset manifest are allowed.
- Stage 03, 06, 07 and 08 regression workflows plus Pages must pass on the **same feature SHA** before promotion, then on main before claiming deployment.
- Full image-layer parallax or extended character animation are later stages; they are not falsely claimed here.

## Editorial boundaries

The painted environment, separate roundbird and native HTML are a coherent illustrated Chapter 04 implementation. The single river painting is not independent foreground/midground layering; final art-direction scoring is not mechanized, and no fake numerical human signoff is declared. Follow the Master V2 character and palette lock. Stop before Stage 10 until authorized.
