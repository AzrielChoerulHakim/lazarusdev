# R12 — Motion without opt-in

All five chapters now start finite motion automatically on entry to the viewport. The three authored Paperkeeper walking frames also play when the study enters view; the R03 atlas actor plays on arrival. Visitor-facing motion choices are hidden, not required for movement.

This changes the experience policy, not the asset inventory: R12 does **not** claim new anatomically drawn frames for chapters 02–05. Existing native buttons and HTML remain in the source as no-JS/fallback structures but motion-choice controls are visually suppressed. No automatic infinite loops or scroll hijacking. The browser/OS accessibility preference `prefers-reduced-motion` is still honored, and failures leave a readable still image.

The previous R04/R11 smoke tests assume opt-in controls and require revision before their contracts can be used to sign off this new behavior. This revision must not be presented as passing those old interaction assertions unchanged.
