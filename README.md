# LAZARUS DEV — The Rupture

A scroll-directed **real 3D WebGL experience** for an independent creative development studio.

## Run locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Implementation

- **Three.js:** real meshes for a fragmented marble bust, stone portal, arched ruins, hovering architecture, moon, floating debris, and a dynamic crimson ribbon. No image/video is passed off as 3D.
- **Scroll as camera direction:** damped camera position and look-at target progress along five story chapters.
- **Progressive enhancement:** WebGL/capability checks, static atmospheric fallback, adaptive pixel ratio, reduced-motion support, pause control, and visibility-based rendering.
- **Interactive editorial layer:** responsive navigation, animated reveal, three explicitly labeled *concept* explorations, project detail dialogs, and a local-only project brief builder that copies content to the clipboard.

## Content truthfulness

The showcased projects are **fictional concept explorations**, *not* completed client commissions. The project brief dialog **does not send** data; wire up a studio-approved contact channel or backend before launching publicly.

## Deployment

Static Vite output works on Vercel: framework **Vite**, build command `npm run build`, output directory `dist`.

## Accessibility and performance

Semantic landmarks, visible keyboard focus, skip link, accessible dialogs, native form validation, `prefers-reduced-motion`, WebGL failure fallback, a motion toggle, capped DPR and geometry budgets. The scene is intentionally stylized/procedural: production-grade photogrammetric sculpture would require separately authored and optimized 3D assets.
