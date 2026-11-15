# Stage 04 — Illustration source and export protocol

Date: 2026-11-15 (Asia/Jakarta).
Scope: asset production PIPELINE, not the five full story scenes.
Visual authority: The Forest Between Pages V2, as locked in ART-DIRECTION-LOCK.md.

## Approval status

The exported transparent WebP files are TECHNICAL ART STUDIES. They are not yet a visually approved rendition of the richly hand-rendered crayon illustration from the Master V2 board. The simple procedural pencil marks intentionally demonstrate composition, source transparency and data provenance; they must NOT be substituted for the original independently art-directed full chapter illustrations.

**Technical readiness may pass while the human non-generic visual gate stays open.** The difference must be reported honestly.

## Production layer anatomy

1. Paper/sky: quiet area for real HTML copy, usually opaque.
2. Backdrop: independent distant trees/landform; no headings baked into a raster.
3. Middle ground: paths, stones, hills, structures and water, separately authored.
4. Foreground foliage: transparent; any depth movement must be restrained and stoppable.
5. Interactive cutouts: independent files with full alpha; actual button/link labels in HTML, not image pixels.
6. Characters: Paperkeeper belongs to Stage 05, not this test pipeline.

Never crop the flattened approved masterboard into fake depth layers or use a generic SVG mascot. Source drawings require silhouette design, material-specific hatching, rich organic edges and coherent universe palettes.

## Folder hierarchy and naming

- Stage 04 test source: scripts/forest_asset_generator.py.
- Test QA: scripts/forest_asset_audit.py and scripts/forest_art_lab_smoke.mjs.
- Test image exports: storybook/assets/exports/.
- Generated provenance records: storybook/assets/exports/manifest.json.
- Future production art source: storybook/assets/source/<chapter>/<asset-group>/.
- Future exports: <chapter>-<object>.<depth-or-role>.<desktop-or-mobile>.webp (or transparent PNG/AVIF where appropriate).
- Browser laboratory: /lazarusdev/storybook/art-lab/ (not linked from the live site's chapter navigation).

Test assets:
- forest-canopy.desktop.webp — transparent 1440x780 foliage depth sheet.
- forest-canopy.mobile.webp — independently re-composed portrait 760x1040 framing sheet.
- crooked-wayfinder.cutout.webp — original transparent 520x720 unlettered wooden wayfinder.

These are THREE independent output files, comprising ONE foreground depth type in two device compositions plus ONE interactive cutout object.

## Production canvas targets (subject to art review)

| Purpose | Suggested source | Web export |
| Desktop original background | ~2400 x 1350 or higher | ~1600–2400 px opaque optimized WebP |
| Mobile portrait composition | ~1200 x 1700 or higher | ~720–1200 px independently composed |
| Transparent foliage | ~2400 x 1350 independent RGBA | ~1440–1920 px WebP/PNG |
| Transparent object | ~1024 x 1024, subject dependent | ~320–600 px WebP/PNG |

No flattened artwork splitting. Each original background, middle-ground and foreground must be authored from a source canvas. The stage 04 technical studies do not claim to have those full production source canvases.

## Master V2 palette

Forest #244F3B; Ink #273829; Paper #F7E9D6.
River #5A8CAF; Sun #F3C354; Clay #D86A4A; Berry #8B6CA8.
Accents are not used for small reading text on Paper. Future artwork may vary pigment locally; UI contrast remains enforced through design tokens.

## Transparent cutout quality

- Alpha channel min 0, max 255, and a fully transparent outer margin around signpost.
- No opaque paper background around isolated props, no clipped important edges.
- Artwork itself contains NO button label, nav anchor, or branded text; semantic HTML provides controls.
- Mobile foreground is drawn with a separate portrait composition, not center-cropped from desktop.
- Test image weights below 290 KB each. Larger scene source and responsive performance budgets must be defined after actual illustration exists.

## Provenance, licenses and export integrity

For every output record: filename/path, dimensions, media type, alpha extrema, per-file SHA-256, export bytes, intended semantic role, source path, licensing, source dates/provenance, external model or photo attribution if any, masterboard-crop boolean.

The Stage 04 generator creates original digitally constructed pencil-like study pixels using deterministic geometry and material-directed strokes, no third-party images, and no sample pixels from the approved flattened board. **Do not call these physically hand-drawn or final master-quality crayon art.** For subsequent original illustrations, keep source canvases and record actual authorship and rights faithfully.

## CI + review

Workflow: .github/workflows/forest-art-assets.yml
- Generates alpha-capable WebP images from source (Pillow).
- Validates all sizes, hashes, transparent margins and portrait-specific source.
- Serves repository in a Pages-shaped folder.
- Browser checks image decode, breakpoint-specific source, alpha pixel, tap target, click response, no overflow, reduced motion, desktop/mobile screenshot.
- Uploads actual images/screenshots as Actions artifacts.
- On isolated feature branch only, commits generated assets to the same feature branch. On main it verifies only.

Technical PASS is not evidence of illustration craftsmanship. Human art-direction signoff against V2 must still verify silhouette, non-repeating strokes, texture following surfaces, non-generic appearance, depth realism, responsive composition and continuity. Any simplified procedural output that resembles flat vectors must be replaced by genuinely art-directed layered illustrations before scene production.

## Stop condition

Do NOT build Paperkeeper, any five full environments, scene transitions, animation systems, or modify homepage illustration mounts during Stage 04. User must explicitly request Stage 05 and later work.
