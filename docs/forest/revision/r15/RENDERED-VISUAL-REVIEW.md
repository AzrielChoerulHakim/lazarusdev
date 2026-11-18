# R15 — Rendered visual review / comparison against the original Atrium poster

**Source rendering:** production Vite pages, Chromium, commit `5a1ebb13f3b40b3e503e53aac505d2acd8696d74`.  
**Reference:** [R13 poster](../r13/evidence/390x844-poster-atrium.png) and [former Atrium 50%](../r13/evidence/390x844-atrium-light-50.png).  
**Current evidence:** [portrait left](./evidence/390x844-light-0.png), [middle](./evidence/390x844-light-50.png), [right](./evidence/390x844-light-100.png), [landscape](./evidence/844x390-light-50.png), [desktop](./evidence/1440x900-light-50.png).

## Source-faithful findings

**1 — Threshold silhouette**: R13's huge near-semicircular arch did not follow the stone folio's pointed doorway. R15 replaces that profile with a pointed threshold and contrasting dark masonry/gold inlay. Relative to the poster, the new portal remains cleaner and sharper at the crown; this is improved silhouette continuity, **not a claim of identical art**.

**2 — Material**: R15 authored diagonal pencil-pressure strokes and stony scumbles on the rear walls, column faces and portal. These are genuine paths, not CSS noise randomly layered over interface text. Yet the screenshot still has repeatable geometric structure, and the original folio has richer pigment pressure and warmer irregular stone contours. A final character/material art director must decide whether this difference is tolerable.

**3 — Light and relief**: Compare actual screenshots 0 → 50 → 100. The screen-space warm patch moves, each pillar produces its own cast region with different direction and reach, and an independently masked raking band changes relief visibility. Geometry tests confirm distinct coordinate paths. In the 50% state the carved ring/leaf motif reads clearly; at the extremes the side lighting feels stronger but the stone still reads as composed vectors. This does **not** constitute a physical ray-tracing claim.

**4 — UX composition**: Full-viewport evidence now shows the light controls in the portrait composition, and the short-landscape scene divides into an illustrated left half and operative console on the right. This avoids requiring the visitor to scroll below the artwork before finding the first control at 844×390.

**5 — Narrative and regression**: The Atrium remains an honest concept from the real hanging folio. The scroll to Work, keyboard, foreground focus isolation, Escape, Back browser, scrollY/scrollLeft restoration and unchanged Oracle/Archive folios pass Chromium integration. Paperkeeper and river-to-house identity are outside this stage.

**Decision:** **TECHNICAL PASS / VISUAL CANDIDATE / HUMAN ART SIGN-OFF NOT SIGNED OFF**. Do not automatically promote it to a final approved painting or claim actual handheld comprehension testing.

## Re-audit after real finger-input and relief fix

Final candidate is tied to [`fe4d68d3`](https://github.com/AzrielChoerulHakim/lazarusdev/commit/fe4d68d3b60e4dc3504b082ff3dbe721b4b0f2d0). Comparing its genuine [left 0%](./evidence/390x844-light-0.png), [middle 50%](./evidence/390x844-light-50.png) and [right 100%](./evidence/390x844-light-100.png), the relief now reaches its strongest legible state around the physical center of the light sweep rather than staying highly visible at the far-right extreme. Side highlights and floor shadow directions still change. The former monotonic increase was a light-model error, not an aesthetic judgment.

The original verification did not include trusted finger gestures. The new [R15 browser run](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625657) proves in Chrome touch emulation that vertical panning does not change the slider and that one horizontal swipe succeeds on both `390×844` and `320×720` for both routes. It also discovered and fixed nested SVG pointer capture cancellation. See the [R15 QA addendum](./QA-RESULTS.md).

Art gap remains: the folio's warm, organic crayon stone is still richer than this authored SVG relief/stone hatch. Technical re-validation cannot award a final human art rubric score. **Visual candidate, not signed off.**
