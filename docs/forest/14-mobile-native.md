# Stage 14 — Mobile-native illustrated composition

**Scope:** Dedicated portrait art and mobile readability for the five-chapter Forest V2 site. No desktop painting replacement, no automatic screenshot capture, no new contact claims.

## Portrait-specific art

Entrance already ships an independently authored mobile painting; it remains the original Chapter 01 portrait source.

Four **additional independent 768×1152 SVG pigment drawings** are now introduced, each with intentionally distinct scene geometry rather than a center crop:

- **Winding Path:** large overhanging twisted roots, forest arch, S-shaped path, fallen bridge. The existing Paperkeeper and moth remain independent transparent character cutouts. The portrait tracing line is redrawn to follow the new route.
- **Work Clearing:** spacious forest clearing, twin trunks, branch canopy and laundry line, composed to frame the existing interactive horizontal hanging folios. The concept illustrations and their honest descriptions remain as authored.
- **River Stories:** willow trunk, broad winding river with separate shorelines and painted stones; existing roundbird and note links stay above the scenery.
- **House on the Hill:** winding ascent, small cottage and lit windows placed for vertical balance; the portrait window-glow image is independently aligned and retains the existing user-triggered light state.

**Material integrity:** These are **digitally scripted, hand-directed SVG drawings**, using many independent colored leaf shapes, fine diagonal pencil marks, overlaid imperfect pigments and displacement. They are not physically hand-drawn paintings, not photographs, and not recrops of existing desktop files. This technical method differs from the Stage 06–10 AI-assisted raster scene source and should receive critical, human editorial scrutiny in Stage 17 for consistency, richness and texture. The desktop scenes and original raster fallback exports have not been altered or misrepresented.

Portrait artwork is treated as decorative only, beneath original semantic HTML, nav anchors, and distinct Paperkeeper sprites. The legacy raster artwork remains available if the new illustration fails or is unsupported; no essential functionality lives inside a raster or SVG.

## QA

Use 320, 375, 390, 430, 670, 768, 1024, 1440 CSS px and 844×390 short-landscape in both GitHub Pages paths. Verify original images decode, new dedicated portrait sources decode at native 768×1152, 44px controls, no horizontal overflow, correct stacking of folios/notes/lights, keyboard interactions, reduced motion and no-JS reading access. **No screenshots or videos are captured, even for CI artifacts.**

This step does not certify an aesthetic score: Stage 17 is reserved for informed human art-direction review. Stage 15 accessibility auditing and Stage 16 performance budgeting remain independently scoped.
