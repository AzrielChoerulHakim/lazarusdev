# R15 — The Atrium, a second world with light that belongs to the stone

**Branch:** `main` · **Implementation:** R15 candidate  
**Art-direction sign-off:** **NOT SIGNED OFF**, until rendered visual inspection by a human.  
**Previous baseline:** R13 images and review; R14 composition/groundline are preserved.

## Audit findings before R15

The R13 [rendered visual review](../r13/RENDERED-VISUAL-REVIEW.md) documented an Atrium provisional score of **6.8/10**: the light slider changed appearance but the columns were too clean, walls too geometrically sterile, and cast shadows did not look structurally connected. Inspection of [the original poster](../r13/evidence/390x844-poster-atrium.png) shows an organic pointed stone gateway with a narrow warm portal; [R13 room mid-light](../r13/evidence/390x844-atrium-light-50.png) had a nearly semicircular foreground and symmetric straight-edged shadows. This is a **source visual contrast**, not an assertion of artistic approval.

## Executed scope

1. **Folio and affordance:** The **original** Atrium, Oracle and Archive artworks and their truthful concept notes remain intact. The existing direct `Enter The Atrium` action is more explicit and occupies its **own** mobile line below the real horizontal gallery; nothing overlays or hides the other two folios.
2. **Door matching:** The new front threshold replaces the semicircle with a hand-directed **pointed stone silhouette**, dark masonry shoulders, uneven gold inlay and discontinuous pencil hatch accents. The portal proportions explicitly reference the existing Atrium poster. A finite 500ms entry clip grows from the source folio's position (or the activator when the folio is out of view). The static end state is immediate under `prefers-reduced-motion`.
3. **Depth and material:** The SVG scene has explicit **rear wall & relief, floor, mid-distance columns, and foreground threshold** groups. New custom directional hatching with pressure variation differentiates weathered wall, column faces and portal; it is digitally authored SVG vector strokes, not an original hand-painted bitmap and not a photographic texture claim. Original folio remains untouched.
4. **Projected light:** Pure geometry module `src/storybook/atrium-lighting.mjs` calculates **separate contact-bound cast polygons and soft penumbras** for the two pillars, recomputing direction, lateral travel and reach from the source X in scene coordinates. The warm wash is *secondary*. The etched garden catches a narrower moving raking beam; independent left/right column sheen follows the same source.
5. **Interaction and access:** Pointer capture horizontal drag, range input, arrow buttons, Tab focus loop, Escape, browser history, URL hash, original document scrollY, horizontal folio scrollLeft and triggering focus are preserved. The main background is `inert` while the dialog is open and restored exactly on exit.

## Engineering boundaries

- No new client work or contact claim. No change to Field Letter submission behavior.
- No redraw of Paperkeeper or alteration to R14 landscape, River, House or the frozen R13 production PNGs.
- The creative light model is a **2D projected approximation**, not physically accurate ray tracing. The pencil hatch is purpose-authored vector pigment texture; human visual inspection must still judge alignment with the raster folio.
- Desktop and `/storybook/` use **matching template markup**, separate canonical metadata.
- Full handheld one-swipe testing and blind human art evaluation remain `NOT VERIFIED` even if automated Chromium interaction tests pass.

## Verification and evidence

- `npm run check:r15:geometry` — deterministic finite source light and shadow geometry + two-route markup parity.
- `npm run check:r15:browser` — Chromium actual build, both routes × `390×844`, `1440×900`, `844×390`; one horizontal pointer swipe, light 0/50/100, slider & arrow buttons, dialog inert & Tab cycle, Back restore, Escape, hash entry and reduced motion.
- `.github/workflows/forest-r15-visual.yml` — production builds + browser tests + actual 24 screenshot frames (2 routes × 3 screens × poster & 0/50/100) as GitHub artifact; curated six root images and manifest are committed under [evidence](./evidence/) when the workflow succeeds. Generated proof is tied to the source commit, not represented as a drawn concept board.

**Release decision:** R15's engineering gate can be green without declaring the new art final. Review the real browser frames at all three critical sizes and compare the pointed opening, tonal balance and shadow projection to the R13 poster before requesting final artistic sign-off.

## R15 re-audit — touch-direction and light-location hardening

The second R15 pass addresses two gaps **not demonstrated by the earlier mouse-only Chromium capture**:

- Finger gesture intent is now direction-locked: a vertical touch on the illustration remains a native scroll gesture and does not flash or teleport the light; a horizontal swipe moves the raking beam. This preserves touch-action `pan-y` rather than suppressing browser scrolling.
- Relief highlights now peak near the actual center of the engraving and taper toward both edges. The old formula contained an increasing slider-dependent term that made the relief brighten at the far-right extreme even after the beam moved past it.
- The entry animation originates from the visible gold opening of the poster and only uses that origin when it is inside the carousel's visible clipped rectangle. When the poster is offscreen it falls back to the real activation link. Coordinates are translated into the animated room frame, not blindly measured from the full viewport.
- New real-touch Chromium emulation covers `390×844` and `320×720`, both published routes, vertical-vs-horizontal gestures, 44px entry-target geometry and browser Back. This is automated Chrome touch input, **not an on-device user test**.

These updates are additive to the existing R15 engineering scope and do not alter R15A's Paperkeeper assets or subsequent chapter storyboards.

### Verification of the R15 re-audit

The extended R15 workflow [run 44274625657](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625657) **PASS** on source `fe4d68d3` for both routes. Automated tests now use **trusted Chromium touch input** for 390×844 and 320×720; they reproduced and fixed an SVG implicit pointer-capture cancellation missed by mouse tests. The newest 24 Chromium frames and six committed source PNGs are recorded in the [QA addendum](./QA-RESULTS.md). Hardware phone testing and final art approval remain **NOT VERIFIED**.
