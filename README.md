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

- **The Oracle:** the original CC0 marble scan by Rico Cilliers (Poly Haven), separated into three exclusive, suspended sections. The photographed face, material and positioning are preserved.
- **The Soft Threshold:** an asymmetrical, continuous stone gateway with rounded liquid pendants, slowly stretching drips, suspended droplets and pooled feet. The opening shares the frame's deformation and respects its depth.
- **Impossible architecture:** twenty-six unsupported stone treads curl upward into a vermilion Möbius band. Instancing keeps the staircase economical to draw.
- **The Hollow Moon:** the existing NASA lunar maps now cover two separated hemispheres, with solid cut faces, an empty central interval and a fine brass orbit.
- **The other reality:** a live, perspective-correct landscape inside the gateway. Its causeway rises out of the sand toward an eclipse, column capitals levitate, and a second stairway twists through the sky. The camera can travel through the opening.
- **Lighting and motion:** HDRI, sculptural warm key and cool fill, atmospheric motes and water. All new ambient motion respects the motion toggle and reduced-motion preference.
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
