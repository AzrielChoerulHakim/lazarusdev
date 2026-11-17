# R12 — Automatic motion for every reader

Date: 17 November 2026. Production baseline: `main@a51c785`.

## Decision

Animation is **automatic**, not an opt-in design setting. The two old movement-choice buttons, "Reveal the whole route" and "Watch Paperkeeper take a step", are absent from both HTML entrypoints. Actual navigation, the Field Atlas disclosure, folio notes, river notes, and the optional functional brightness control remain clickable because they control content or lighting, not whether the reader is allowed to see movement.

## What plays without requiring an interaction

- Entrance: canonical R03 nine-frame Paperkeeper invitation plays once when the real character is in view after the page loads.
- Atlas: a separate grounded R03 Paperkeeper animates automatically on entering view; the native atlas can still trigger the short acknowledgment on opening.
- Winding Path: a pencil route physically draws itself on arrival; existing genuine three-pose walking study plays automatically; the moth moves gently within the visible scene.
- Work Clearing: hanging folios sway lightly when visible, and give finite responses when individual native concepts are opened.
- River Stories: roundbird and ripple move within the real drawing; opening a note still reveals its native HTML and ink underline.
- House on the Hill: light on the authentic painted windows varies gently as the visitor reaches it, without waiting for a click. The existing manual brightness action changes intensity, not whether the scene moves.
- Seams between chapters draw once when encountered.

A device reduced-motion preference changes intensity/timing of small environmental movement, **not** the automatic activation policy for the requested authored acting. The motion is bounded spatially, never blocks scrolling/navigation, and does not announce decorative changes to assistive technology. Failed image decode retains genuine static source assets.

## QA and honest boundaries

Both root and /storybook/ compiled routes use identical behavior. `npm run check:r12` verifies the automatic acting, path, walking study, Work/River/House cues, responsive viewport and no-JS reading fallback in Chromium. Regression QA covers Stage 07, Stage 11, Stage 12, R04, R08, R11, Stage16 and Stage18. Text-only QA: no automated screenshot, video, trace or recording.

R12 does not claim newly created anatomical pose sets for all scenes or four full new background paintings. Those remain separate art production requirements.
