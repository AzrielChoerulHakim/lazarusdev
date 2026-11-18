# R15 — Engineering QA results / genuine rendered Atrium frames

**Source-code commit under test:** [`5a1ebb13`](https://github.com/AzrielChoerulHakim/lazarusdev/commit/5a1ebb13f3b40b3e503e53aac505d2acd8696d74).  
**Rendered-evidence commit:** [`34c95af3`](https://github.com/AzrielChoerulHakim/lazarusdev/commit/34c95af38dec91392b228d2d50ae314a66cd46f3).  
**Browser evidence:** [manifest](./evidence/manifest.json) and PNGs below.  
**Human art-direction sign-off:** **NOT SIGNED OFF**.

## Checks that actually ran

| Workflow | Status at source-code commit | Link |
|---|---|---|
| R15 geometry + real browser light, responsive, keyboard, history and screenshot capture | **PASS** | [Run 44268825285](https://github.com/AzrielChoerulhakim/lazarusdev/actions/runs/44268825285) |
| R12 existing Atrium + paper-rescue journey regression | **PASS** | [Run 44268825379](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825379) |
| R13 full rendered scene capture, including unchanged frozen evidence | **PASS** | [Run 44268825252](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825252) |
| R08–R09 release/integration | **PASS** | [Run 44268825521](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825521) |
| Stage 03 responsive and semantic UI | **PASS** | [Run 44268825436](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825436) |
| Stage 15 accessibility audit | **PASS** | [Run 44268825250](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825250) |
| Stage 14 dedicated portrait art checks | **PASS** | [Run 44268825312](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268825312) |
| GitHub Pages build and deployment | **PASS** | [Run 44268824211](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44268824211) |

The R15 workflow produced **24 actual Chromium PNGs**: two routes × three viewport sizes (`390×844`, `1440×900`, `844×390`) × four states (poster and Atrium lamp 0/50/100). Complete artifact: `forest-r15-atrium-5a1ebb13f3b40b3e503e53aac505d2acd8696d74`, artifact ID `14410873205` (~8.21 MB); the exact source SHA and per-frame SHA-256 are stored in the manifest. This is a real browser render from the Vite production build, not a synthetic collage.

## Curated images for visual comparison

| View | Actual screenshot |
|---|---|
| Original Atrium poster on portrait | [390×844 / poster](./evidence/390x844-poster.png) |
| Room / left lamp 0 | [390×844 / 0](./evidence/390x844-light-0.png) |
| Room / middle lamp 50 | [390×844 / 50](./evidence/390x844-light-50.png) |
| Room / right lamp 100 | [390×844 / 100](./evidence/390x844-light-100.png) |
| Room / desktop | [1440×900 / 50](./evidence/1440x900-light-50.png) |
| Room / short landscape | [844×390 / 50](./evidence/844x390-light-50.png) |

## Rendered inspection observations — not a user-test result

- At **390×844**, the new threshold is clearly pointed and materially distinct from the previous semicircular SVG. Intro, slider, both buttons and light feedback are within the captured viewport. The garden relief becomes most legible around the middle lamp position.
- At **844×390**, the main scene and controls now sit side by side; before the follow-up UI change, controls were below the scene and a screenshot of an oversized inner element could misleadingly include pixels from outside the fixed modal. Final evidence captures **the fixed viewport element** instead.
- At **1440×900**, the gold portal and columns are legible at one glance, with the editorial/slider console on a paper-colored lower stage.
- The individual shadow path geometries at 0, 50 and 100 differ and change direction. Color and pigment appearance remain an artistic judgment, not automatically certified by geometric assertions. Hand-directed SVG hatch is a digital approximation; **the much richer crayon texture of the original poster is not yet reproduced one-for-one**.

## Not verified / outstanding

- Human blind recognition test and explicit art-direction rubric (all criteria >=4/5, average >=4.5/5): **NOT VERIFIED**.
- Real physical phone one-handed gesture, screen-reader session and texture sign-off: **NOT VERIFIED**.
- Pencil-stone authenticity and physical cast-shadow plausibility are still candidates for a visual-art reviewer; numerical tests only prove distinct projected geometry and responsive interaction.
- R15A sprite cleanup, R16 single paper, R17 painted dusk and R18 final art calibration are not part of this R15 implementation.

**Conclusion:** R15's technical build, real Chromium integration and capture gates **PASS** at the tested source SHA; the manual art approval gate remains **NOT SIGNED OFF**. Preserve R13 frozen reference PNGs when continuing.


## R15 follow-up / real touch gesture regression — 18 November 2026

**New production source:** [`fe4d68d3`](https://github.com/AzrielChoerulHakim/lazarusdev/commit/fe4d68d3b60e4dc3504b082ff3dbe721b4b0f2d0).  
**New frozen screenshot commit:** [`4ea2ed45`](https://github.com/AzrielChoerulHakim/lazarusdev/commit/4ea2ed458f7ecfedf16cbde280ae40a13eb1e8ea).  
**Actual R15 browser workflow:** **PASS**, [run 44274625657](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625657).  
**Genuine PNG artifact:** `forest-r15-atrium-fe4d68d3b60e4dc3504b082ff3dbe721b4b0f2d0`, ID `14414062574`, 7,629,537 bytes.  
**Manifest:** [`evidence/manifest.json`](./evidence/manifest.json), source `fe4d68d3...`, **24 frames** (2 routes × 3 viewports × 4 captures).

| Check at source commit `fe4d68d3` | Status |
|---|---|
| R15 production build, deterministic light geometry and browser regression | **PASS** |
| **NEW:** Trusted Chrome touch gesture, vertical panning must not move light, horizontal single-swipe must reveal leaves — **both routes, 390×844 and 320×720** | **PASS** |
| Mobile/desktop/short-landscape root + storybook; keyboard, one mouse drag, Back, focus, Escape, reduced motion | **PASS** |
| R12 Atrium and paper rescue regression | **PASS** — [run 44274625491](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625491) |
| R13 rendered visual evidence workflow | **PASS** — [run 44274625535](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625535) |
| Stage 03 semantic/responsive | **PASS** — [run 44274625928](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625928) |
| R08–R09 release/integration | **PASS** — [run 44274625667](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274625667) |
| GitHub Pages publish | **PASS** — [run 44274624183](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44274624183) |

**Issue caught by the new test, and resolved:** in Chrome a touch pointer may acquire implicit capture on a nested SVG child. Re-parenting capture onto the scene causes that child to emit a bubbling `lostpointercapture` event and prematurely terminates the swipe. The corrected gesture implementation preserves implicit touch capture, ignores descendant-only capture loss, and locks touch intent by axis. This behavior was **not** covered by the earlier mouse-only test even though its workflow was green.

**Visual inspection of the newest images:** [0%](./evidence/390x844-light-0.png) and [100%](./evidence/390x844-light-100.png) leave the medallion relatively quiet, whereas [50%](./evidence/390x844-light-50.png) reveals a bright central leaf/carving motif. This is intentionally source-location-dependent instead of a uniform opacity increase with slider percentage. It is a rendered screenshot observation, not a human art-direction approval.

**Human blind art-signoff, physical-device UX, and screen-reader signoff:** **NOT VERIFIED**. R15 remains a **technical pass with candidate art**. The above re-run supersedes the older verification source/IDs above, which are preserved as historical evidence.
