# Stage 07 — Winding Path production assets

- `source/winding-path-crayon-source.webp`: purpose-created original digital colored-pencil/crayon landscape. 1536×1024, no text or mascot baked into painting.
- `exports/winding-path-desktop.webp`: compressed desktop landscape, standalone illustration.
- `exports/winding-path-mobile.webp`: separate *portrait composition export* produced by a curving scanline remap following the trail; **derived from the new Stage07 source**, not a freshly generated portrait painting. It is **not** a crop of the approved V2 masterboard. Stage14 remains responsible for a fully independently drawn mobile composition if final art direction requires it.
- `manifest.json`: SHA256, size, dimensions and provenance.
- Existing Stage05 `characters/paperkeeper.three-quarter.webp` and `characters/moth.guide.webp` are independent, reused as true alpha images; never raster-baked into the environment.

The trace route is an independent SVG **interactive annotation** over genuine original raster artwork, not an SVG substitute for a forest scene. It follows native scroll passively, has an accessible explicit reveal toggle, and becomes static under `prefers-reduced-motion`. Do not add infinite animations or scroll interception.

No screenshot captures or screenshot artifacts, per studio's current workflow preference. Browser checks still audit real layout and interaction.