# R06 — Finite scene-response system

Branch `feat/r02-entrance`, 17 Nov 2026.

## Implemented

The five authored forest chapters remain navigable with ordinary links and native details. R04 owns Entrance character-frame animation. R06 adds an independent **pigment-response layer** to the next four settings:
- Winding Path: the existing "Reveal the whole route" action briefly enlivens the engraved waymark (700ms).
- Work Clearing: clicking a hanging exploration or opening a native concept note marks the active folio and makes its separate paper/thread engraving respond (650ms).
- River Stories: expanding a native river note gives a finite drawn-ripple response (850ms).
- House on the Hill: the window-light button still toggles actual illustrated window light and now briefly accents its independent ink engraving (750ms).

The original Stage11 small walk remains an explicit three-pose motion *study*, not a new R05 full-scale walk cycle. Legacy CSS full-body tilt/glance effects on reader, hanging and House figures are suppressed instead of represented as authored anatomical acting. This avoids claiming pose frames that were never created.

## Motion contract

- No user action is blocked or awaited. Native toggle/link/button continues to work with JS disabled.
- No autoplay, infinite loop, scroll locking, focus movement or generic transition on body elements.
- One 650–850ms effect per event; new cues replace a pending cue; hidden tab and pagehide settle immediately.
- Reduced motion goes straight to the stable ink mark.
- Decorative SVGs use no text and `pointer-events:none`, so all project notes remain readable.

## Limits

R01's four full, independently drawn new gesture sets and R05's completely new portrait/desktop painted environments are not generated here; R06 delivers honest ambient editorial response, not false characterization of completed scene animation. R07 considers art direction and real-text layout; R08 owns integration/QA, R09 production promotion.
