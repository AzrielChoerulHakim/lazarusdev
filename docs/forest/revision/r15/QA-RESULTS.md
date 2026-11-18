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
