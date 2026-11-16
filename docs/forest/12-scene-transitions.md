# Stage 12 — Scene Transitions / A thread between pages

**Scope:** Chapter-to-chapter continuity connecting the five existing illustrated scenes. This is **not** Stage 13 conversion or Stage 14 independent mobile redraw.

## Editorial idea

The site is a small physical field book, not five disconnected landing-page banners. The stitched paper seam between every chapter carries a distinct *field mark* in the page margin and a meaningful native link to the next destination. The four marks describe different movements: a curving pencil path, branching roots, a drifting folio over water, and a lamp-lit hill. Their ink lines are authored original SVG **annotations only**; the previously approved colored-pencil illustrations and character artwork are unchanged. The seams borrow exact neighboring chapter colors, with irregular paper tears at the top edge rather than an artificial full-screen wipe.

Four native `nav` regions appear directly between the five existing `section[data-chapter]` elements on both routes. Links are real fragment destinations and work with all scripts disabled. Each label describes where the user goes. Native browser scrolling is retained; clicking skips no intermediate content and has no scroll hijacking.

## Motion policy

`forest-seams.js` uses `IntersectionObserver` to draw a seam's decorative ink trail only once, when the seam appears. Nothing else becomes hidden or unclickable. With no JS, the lines are already drawn; with `prefers-reduced-motion: reduce`, they appear instantly. There is no global fade-in, horizontal drag carousel, sticky scroll progress, autoplay, mandatory animation, forced scroll, or network request.

The visual transition remains a lightweight **paper-to-paper bridge**, not a multilayer cinematic parallax or an assertion that hand-painted split layers exist. Reusing the existing source art preserves the Stage 05 Paperkeeper silhouette and continuity across the journey.

## Gates

A semantic Python audit verifies exact five-chapter order, four destinations and unique accessible H1. A Playwright text-only smoke checks two compiled GitHub Pages routes at 8 viewports, horizontal overflow, 44px minimum targets, native hash links, first appearance of ink, reduced motion, no-JS fallback, and runtime errors. No screenshots or video frames are taken. Regression Stage 03, 06–11 must pass with GitHub Pages on the same production SHA.

The stage does not change studio's unverified contact endpoint, concept-only portfolio labels or editorial article status. Stage 13 onward remain separate.
