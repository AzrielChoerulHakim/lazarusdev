# M01 — Lantern invitation / R03

Nine registered drawings: R02 neutral plus eight authored acting poses. Same 622×960 canvas, planted feet and acorn lantern; no whole-character rotation. Four transparent source strips retain the production drawings. `timeline.json` owns pose intent and nonuniform holds; `manifest.json` records sources, hashes, alpha bounds, foot pivot, scale, lantern-light trajectory and export details.

The first invitation takes **1200 ms**: notice → anticipation → lift → overshoot → follow-through → settled. Reopening after completion uses a **560 ms acknowledgment** from the raised-lantern pose. Closing the atlas must not reverse the action. The settled frame remains visible indefinitely; there is no loop.

## Engine contract for R04

`src/storybook/entrance-acting.js` exports `createEntranceActing(existingImage)`. Construction preserves the existing static fallback and downloads nothing.

- `prepare()` decodes the action before use. Reduced motion prepares only `settled`. Call when the scene is near, without blocking navigation.
- `play()` starts one finite action and returns whether accepted. Repeated input while loading/playing is ignored, never queued. Caller must not await this in a navigation handler.
- `cancel()` settles a prepared action immediately. If decoding is still pending, the working fallback stays until a valid final drawing is ready.
- Hidden document, offscreen character, page exit and a change to reduced motion cancel playback. Returning does not replay.
- A failed decode preserves the existing image and leaves native controls usable. `destroy()` removes listeners/observers/timers and prevents late writes.
- `state` and `data-acting-state` expose lifecycle; `data-acting-frame` identifies the shown drawing. No live-region narration, focus movement or scroll interception.

R04 mounts the engine to the native atlas `toggle` event. R03 does not add a demonstration button, public player or additional preview page.

## Production and checks

```sh
npm run assets:r03
npm run check:r03:assets
CHROME_PATH=/usr/bin/chromium npm run check:r03
```

Drawing/editing uses OpenAI image_gen, referenced from the R02 character and successive production strips. Extraction, uniform scaling, transparent-margin registration and WebP encoding use Sharp; no pose is synthesized with CSS or a transformed whole-body cutout. Neutral retains the exact R02 WebP bytes. The same scale is used across the eight new drawings so head dips and follow-through are preserved.

All nine WebPs total 1,482,532 bytes; the eight new drawings total 1,291,420 bytes. The runtime reuses the original neutral URL. Reduced motion needs only the 167,476-byte final pose. These assets are not imported by the public page until the R04 integration.

The browser test compiles the actual module with Vite, serves an ephemeral native-control fixture and observes playback at 280/167/136 px. It verifies frame order/timing, replay, lazy loading, keyboard/touch/pointer, cancellation, reduced motion, failure and disposal. No screenshots, recordings, packaged demos or preview artifacts are produced.
