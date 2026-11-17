# R10 — Experience-quality correction after field review

Date: 17 November 2026. Production baseline: `main@fd002a1`.
The previous R09 CI release was technically valid but did not establish art-direction signoff.

## Corrected user-visible regressions

- **Visible acting:** R04's hero Paperkeeper was offscreen whenever the reader arrived at the Field Atlas, so the guard correctly cancelled animation. A second grounded, transparent instance of the genuine R02/R03 character now lives beside the **native atlas summary**. Clicking `A map for the curious` both opens the atlas and retains its native fragment navigation; the character now acts in the destination viewport. Native summary click/Enter/Space/tap also activates it. No autoplay, forced delay, scroll interception or fake demo control.
- **Mobile art parity:** Source already contained finely hatched, companion mobile WebP paintings for Path, River and House, but Stage14 simplified SVG masks obscured them. Restore the original mobile painted scenes. Work Clearing restores its detailed landscape painting behind the real folios, with natural responsive cropping. Coarse Stage14 SVG studies remain in source but are not promoted as final art.
- **Window integrity:** Bring back the pixel-compatible mobile **raster window-glow** overlay to the actual painted cottage instead of using the simplified SVG glow layer.
- **Reading rhythm:** Reduce chapter/seam whitespace, intro-to-scene gaps, folio/field notebook gaps and the closing House tail. Preserve all substantive HTML.

## Honesty about art production

This is material restoration and UX repair, **not** a fabricated claim that all four main scenes were newly re-painted, or that new anatomical gestures have been drawn for Chapters 02–05. Existing rich desktop originals remain in place. A House portrait art exploration generated separately is not released without a reproducible binary/source upload and visual review.

## Acceptance

Both built entries must pass the R04 finite acting contract with the animation on screen in the real cue-click journey. Existing Stage14/Stage16 checks are updated from outdated `SVG is primary` assumptions to verify the actual visible WebP painting and native glow. Re-run R02/R03, Stage14, Stage16, R08/R09 and Stage18. Capture text-only diagnostics, never screenshots or videos. Commit to `main` only after green branch CI.
