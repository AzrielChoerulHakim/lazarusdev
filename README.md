# LAZARUS DEV — The Rupture

A surrealist digital experience for an independent creative development studio. **Actual interactive WebGL**, not a video, iframe, or still-image parallax.

**Live:** https://azrielchoerulhakim.github.io/lazarusdev/

## Get started

```bash
npm install
npm run dev
npm run build
npm run preview
```

The website works both as a Vite build and directly from GitHub Pages source (using a pinned Three.js import map). Set Vercel's framework to **Vite** and output directory to **dist** if connecting a Vercel project later.

## The world

- **CC0 artist-modelled bust:** a real 3D marble sculpture by Rico Cilliers (Poly Haven), with embedded glTF PBR maps. Two independently clipped instances create a surreal gap across the face. The original procedural bust remains a loading/failure fallback.
- **Weathered architectural surfaces:** three local photographic sandstone PBR maps (diffuse/normal/roughness), CC0 by Dimitrios Savva, on original procedural masonry. Fine abrasions follow column curvature, and small instanced limestone grains settle across the portal foundation.
- **Lighting:** coordinated HDRI and upper-left golden-hour key, gentle cool photographic fill, sculptural rim light and targeted portal glow; bias-corrected high-resolution soft shadows on capable GPUs.
- **Atmosphere:** hundreds of depth-tested, softly shaded 3D limestone motes (including fine sediment falling through the scanned fracture), subdued distance haze, procedural clouds, a responsive water shader with subtle contact occlusion beneath the portal foundations, moon and carved stone architecture.
- **Motion:** multi-subdivision folded cloth geometry, a portal shader, scroll-following camera paths with separate mobile framing and restrained pointer parallax.
- **Editorial website:** selected worlds (clearly marked concepts), capabilities, manifesto, accessible navigation, dialogs, and a local-only project brief builder.

**Attribution and exact SHA-256 hashes:** [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md).

## Quality pipeline

```text
GitHub push
  ├── verify JS syntax + Vite production build
  ├── Playwright WebGL 2 desktop/mobile: verify bust and sandstone actually load
  ├── test navigation, project detail dialogs and portal scroll
  ├── save screenshots to GitHub Actions artifacts
  └── render isolated visual QA branch snapshots for art-direction review
```

Build and browser verification: [GitHub Actions](../../actions/workflows/build.yml).

Visual snapshot workflow: [GitHub Actions](../../actions/workflows/visual-qa.yml).

The snapshot screenshots live on separate `visual-qa-<commit>` branches rather than inflating the main production repository.

## Performance and accessibility

- Hardware/software renderer detection; software GPU disables dynamic shadows and reduces pixel ratio; mobile has an independent resolution budget.
- `prefers-reduced-motion`, a working motion toggle, visibility-aware animation loop and a usable no-WebGL fallback.
- Semantic headings, focus styles, accessible dialogs, keyboard-usable navigation, skip link and native brief validation.
- Progressive GLB/PBR loading; the HTML experience remains available during downloads.

## Remaining production requirements

- The sample project cards are **fictional explorations**, not completed client commissions.
- The brief dialog **does not send** data. Connect a verified studio contact channel or backend before taking client requests.
- This CC0 marble sculpt is **not the exact head in the reference painting**. Matching that illustration exactly would require a custom sculpt and art-directed topology work.
- Professional cross-browser physical-device profiling and visual sign-off are still recommended before marketing claims such as a guaranteed 60 FPS.
