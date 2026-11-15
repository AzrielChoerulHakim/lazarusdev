# 00 — Baseline and Protection
**Recorded:** 2026-11-15 (Asia/Jakarta)  
**Status:** Stage 00 — baseline captured; production untouched.

## Repository and immutable baseline
- Repo: https://github.com/AzrielChoerulHakim/lazarusdev
- Production branch at capture: `main`
- Baseline SHA: `e5edde4d2b1b5a0345432cc8e472905b1364e9d4`
- Baseline tree: `65fac39f405211fad78abf553e6708c0120295ad`
- Baseline commit: https://github.com/AzrielChoerulHakim/lazarusdev/commit/e5edde4d2b1b5a0345432cc8e472905b1364e9d4
- Production URL: https://azrielchoerulhakim.github.io/lazarusdev/
- Archive ref (do not rewrite): `archive/3d-pre-storybook-2026-11-15`
- Storybook development ref: `feature/forest-storybook`

**Safety rule:** never commit storybook experiments to `main`. Never overwrite the old 3D root index, 3D scene modules or deployment workflow in stage 00. Main stays the currently published experience unless a later release has been explicitly approved.

## Legacy stack and behavior
- Vite 7, JavaScript ESM, Three.js ^0.180.0; root `index.html`, `src/main.js`, `src/styles.css`, and modules in `src/`.
- Scene includes the existing stone bust, liquefied / surreal architectural portal, HDRI and PBR materials, atmospheric particles and scroll-led camera.
- Existing `index.html` uses normal navigational anchors, WebGL canvas, project-detail dialogs, project brief copying (not submission), and a motion toggle.
- Demo project cards are studio concepts, not verified commissioned projects. New website must not invent clients or outcomes.
- Existing asset credits documented in `assets/ATTRIBUTION.md`; preserve licenses and source records.

## Existing GitHub workflows — verified at this exact SHA
1. Build and browser verification — **success**, run https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/43139762357
   - Executes syntax verification and Vite build; Playwright WebGL desktop/mobile smoke tests and GitHub Pages source smoke tests.
2. Visual QA snapshots — **success**, run https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/43139762360
   - Head SHA `e5edde4d2b1b5a0345432cc8e472905b1364e9d4`; created isolated `visual-qa-e5edde4d2b` snapshot branch.
3. Pages build and deployment — **success**, run https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/43139761097
   - Production deployment ran for `main` at the same SHA.

Evidence of successful runs comes from GitHub Actions historical result; **no new CI run** is claimed for the documentation-only Stage 00 commit.

## Archived real 3D screenshots
Source: `visual-qa-e5edde4d2b/docs/qa/*.jpg`, rendered via `scripts/visual-review.mjs` in CI using the baseline 3D WebGL assets (not synthetic mockups). Exact original Git blob objects are preserved below at new paths on the feature branch.

| Snapshot | Viewport (CSS px) | Feature-branch path |
| --- | --- | --- |
| Hero — desktop | 1440 x 900 | `docs/forest/baseline-shots/hero-desktop.jpg` |
| Passage — desktop | 1440 x 900 | `docs/forest/baseline-shots/passage-desktop.jpg` |
| Crossing — desktop | 1440 x 900 | `docs/forest/baseline-shots/crossing-desktop.jpg` |
| Worlds — desktop | 1440 x 900 | `docs/forest/baseline-shots/worlds-desktop.jpg` |
| Hero — mobile | 390 x 844 | `docs/forest/baseline-shots/hero-mobile.jpg` |
| Passage — mobile | 390 x 844 | `docs/forest/baseline-shots/passage-mobile.jpg` |

These screenshots are generated in a CI browser from the same source commit; they are *not* asserted to be a direct capture of the public GitHub Pages URL. Review actual visual quality separately.

## Deployment and safe preview decision
- A successful **pages build and deployment** workflow exists for the `main` SHA. The repo README says the site also works directly via branch-root GitHub Pages.
- **Limitation:** GitHub Pages settings endpoint was not exposed by the connected GitHub API, so the actual Pages source folder/branch is *not yet independently confirmed*. Do not assume `/storybook/` is publicly served just because the folder exists in a feature branch.
- **Chosen safe preview mechanism:** publish screenshots and browser test reports as artifacts on a separate feature/QA workflow or review branch; only introduce an isolated `storybook/` URL / preview hosting in Stage 02, after verifying Pages or approved independent hosting. Do not point the live root to storybook during development.
- GitHub reports `main` as **unprotected** (`protected=false`). Process protection is achieved through branch isolation and no `main` mutations, **not** by an enforced GitHub ruleset. Administrative ruleset setup remains a separate hardening action if access is later provided.

## Rollback / recovery contract
**Today:** zero change was made to production; rollback requires no action.

**If a later approved storybook release changes `main`:**
1. Record the release's commit SHA / merge commits and any changed Pages configuration in its release report.
2. Prefer a new recovery PR that **reverts** the storybook integration commit(s) on `main` (for a merge commit use `git revert -m 1 <merge-sha>`; for a squash commit revert the squash SHA). Do not force-push or rewrite `main`.
3. Confirm the recovered source content matches the archive ref / baseline tree as appropriate, including 3D assets, and that Pages deploy and browser QA pass again.
4. If deployment settings changed, restore the previous Pages source first; confirm the public 3D root in a real browser.
5. The stable archive ref `archive/3d-pre-storybook-2026-11-15` and SHA `e5edde4d2b1b5a0345432cc8e472905b1364e9d4` provide the source reference, regardless of newer commits.

Do not mistake `git reset --hard` of a local checkout for a safe production recovery; use a reviewed revert and CI.

## Stage 00 verification checklist
- [x] main SHA and tree recorded
- [x] existing 3D CI and deployment successful at baseline SHA
- [x] isolated storybook feature branch created
- [x] immutable-in-process 3D archive branch created
- [x] six real 3D CI screenshot objects preserved in feature branch
- [x] explicit rollback path documented
- [x] `main` untouched by Stage 00
- [ ] Pages source setting independently verified (blocked by unavailable settings endpoint; required before implementing preview in Stage 02)
- [ ] GitHub branch protection enforced by ruleset (not performed / `main` currently unprotected)

**Next task:** Stage 01 — mapping actual Lazarus content and chapter narrative; do not begin Stage 02 automatically.
