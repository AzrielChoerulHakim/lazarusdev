# R14 — Post-change CI and rendered capture results

**Visual implementation commit:** [b847fa45](https://github.com/AzrielChoerulHakim/lazarusdev/commit/b847fa45ea8a5b8c6cd2627b75ba0ec0bc57c1cd)  
**Verification source:** GitHub Actions executed against that exact commit.  
**Final visual art sign-off:** **NOT SIGNED OFF**.

## Completed automated checks

| Workflow | Status | Evidence |
| --- | --- | --- |
| R13 Chromium rendered visual capture, including `npm run check:r14` | PASS | [Run 44265650892](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44265650892) |
| R12 Atrium + paper rescue journey | PASS | [Run 44265650802](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44265650802) |
| R08–R09 integration and release gates | PASS | [Run 44265650819](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44265650819) |
| Stage 03 semantic and responsive audit | PASS | [Run 44265650853](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44265650853) |
| GitHub Pages build and deploy | PASS | [Run 44265649469](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44265649469) |

The R13 capture workflow rebuilt BOTH production routes, passed the R14 source/PNG integrity gate, served the production output and completed the scripted Chromium scene, poster, Atrium and paper-journey captures. The entire PNG/manifest archive is available within that run as artifact:

`forest-r13-visual-b847fa45ea8a5b8c6cd2627b75ba0ec0bc57c1cd` (GitHub artifact ID `14409229308`, ~95.5 MB).

The original R13 frozen screenshots under `docs/forest/revision/r13/evidence/` were **not overwritten**. The R14 HTML contact sheet intentionally continues to use that fixed baseline to permit reproducible before-vs-after comparisons; new post-change PNGs are stored in the Action artifact and must be inspected separately.

## Open artistic and physical-device gates

- **New scene-by-scene screenshot inspection:** NOT VERIFIED. Automatic capture succeeded, but 141 new images have not all been visually adjudicated by a human.
- **Blind label-free thumbnail identification for Clearing, River and House:** NOT VERIFIED.
- **River control/Paperkeeper collision:** previous 82.76% intersection was addressed by moving the navigation below the mobile figure. A new DOM pixel-overlap measurement and human visual review were **not** independently recorded in this report.
- **Dusk house physical relighting, independently painted Clearing portrait, one distinct river paper and Paperkeeper alpha/crop repairs:** intentionally pending their specifically scoped R15A/R16/R17/R18 stages. Tonal filter candidates do not substitute for source illustration repaint.
- **Real-phone one-handed inspection and final human art-direction scoring:** NOT VERIFIED.

**Result:** R14 candidate code, sheet, scene constraints and automated build/capture gates are on `main`; no false claim of final art approval.
