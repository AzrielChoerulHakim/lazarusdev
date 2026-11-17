# R04 — Entrance: native atlas integration

Date: 17 November 2026. Base: `feat/r02-entrance@b7fe6f0` (R03).
Scope: connect the approved Entrance to the existing finite acting engine; no visual reconstruction of other chapters and no public release.

## Decision and implementation

- The R02 illustration, transparent Paperkeeper still, figure dimensions, ground contact shadow, copy and both entry routes are retained unchanged.
- `src/storybook/entrance-acting-integration.js` mounts `createEntranceActing(image)` from R03 on the existing R02 image and listens to the **native** `details#field-atlas` `toggle` event.
- Atlas opening triggers the 1,200ms authored lantern invitation. Subsequent openings use R03's 560ms acknowledgment. Closing does not reverse the pose; no gesture is autoplayed or looped.
- For motion-enabled visitors, image preparation starts when Paperkeeper is within 160px of the viewport and after window load. Reduced-motion visitors retain the original critical R02 still until they actually open the atlas, whereupon only the final static pose is decoded. This avoids changing the hero image while browser LCP/image decoding is still in flight. R03 handles loading, failure, animation state and cancellation.
- The native control is never prevented, delayed, replaced, re-focused or auto-scrolled. Keyboard, touch, anchor navigation and no-JS reading remain intact.
- Reduced-motion uses a static settled pose. Failed frame decoding keeps the R02 still.

## Known visible-behavior boundary

The Field Atlas naturally follows the Entrance illustration. If an atlas opening occurs with Paperkeeper **already offscreen**, R03 intentionally does not start an invisible gesture; the atlas still opens. R04 does not pin the character, duplicate it, or force scroll simply to manufacture an animation. The character/atlas sightline is a legitimate R07 artistic review question, not an excuse to alter R02 without direction.

## Test contract

`npm run check:r04` runs real Chromium checks against the **built** root and alternate /storybook/ entries under /lazarusdev/. Covers desktop 1440, mobile 390 and narrow 320; first invitation; finite acknowledgment replay; no autoplay; no scroll hijack; no full-body CSS transform; reduced motion; keyboard; no-JS; failed-frame fallback; offscreen cancellation. Existing R02/R03 suites are rerun in GitHub Actions.

The workflow produces text diagnostics only, and never calls screenshots, video recording or trace capture. Passing tests prove browser behavior, **not** final illustration quality.

R04 is deliberately committed only to `feat/r02-entrance`. R08 owns stylesheet consolidation; R09 owns publication and main promotion. R01–R03 references remain preserved.

## Release regression: critical image decoding

A main-branch Stage16 performance audit exposed an image-decode race on cold reduced-motion loads when the idle Paperkeeper was replaced by a new static drawing during its own `decode()` call. R04 now **defers reduced-motion settled-frame loading until the native atlas is opened**, while preserving non-reduced near-viewport warmup. The R04 compiled-browser regression explicitly checks idle image stability before Enter and final settled pose after opening. Stage16 is required to pass before this fix reaches main.
