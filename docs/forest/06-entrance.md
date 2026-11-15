# Stage 06 — Entrance / illustrated gateway

Status: **implemented on feature branch as an art-direction candidate; NOT approved for main**.

The Entrance scene uses an original image-generation-assisted colored-pencil woodland gateway, not a cropped masterboard. It is delivered as a standalone compressed WebP file at 1280 × 853, overlaid with the existing Stage 05 Paperkeeper three-quarter transparent cutout. All real copy, links and navigation remain semantic HTML. No fake animation or scroll control.

Source asset: `storybook/assets/scenes/entrance/entrance-forest.desktop.webp`. Source image generated 2026-11-15; digital illustration, not a physical hand drawing. Copyright/usage: newly generated for Lazarus Dev. Image is not extracted from the locked masterboard. The output is an independent flattened environmental illustration **rather than final separated parallax layers**.

Important review gates **still open**:
- Independent background, midground and foreground production artwork is not yet available. A flattened scene must not be represented as completed layered production art.
- Mobile currently reuses the same image with a separate CSS framing; this is **not** the original mobile recomposition required by V2.
- Paperkeeper overlay should be inspected for scale, grounding, lighting and visual continuity.
- Master V2 anti-generic art rubric requires human review; CI cannot certify originality.
- Stage 03 functional regression and contrast must pass before any release.

Scope stops at Stage 06. No Stage 07 Winding Path scene or Stage 11 animation.

A second exploratory generation with baked-in copy and a redesigned blue-clothed human protagonist was rejected. It was not exported into the repository, because it violated the character bible and live HTML content rule.
