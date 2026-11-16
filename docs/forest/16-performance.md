# Stage 16 — Performance, without sacrificing the illustrated forest

## Scope

Improve the first impression and reduce needless render competition, **not** simplify the five original scenes or claim a new artistic quality. Stage 17 remains the deliberate anti-generic creative review.

## Implementation

1. Publish a **media-matched, high-priority image preload** for the Entrance landscape in both compiled routes. Mobile only discovers `entrance-mobile.webp`; desktop only discovers `entrance-desktop.webp`. The original responsive `<picture>` remains canonical, so Chrome can reuse the same URL instead of downloading both. The original Paperkeeper guide is marked high priority as part of the hero. All other scene images are explicitly low fetch priority and remain lazy-loaded, except the existing small Entrance leaf cue. No image was deleted or replaced by a lower-quality version.
2. Mark only **fixed-ratio illustrated canvases** (Winding Path, Work Clearing, River Stories, House) with `content-visibility: auto` behind `@supports`. Browsers may skip complex pencil/filter painting outside the viewport, but the image markup, real links, stable aspect ratios, native scroll and no-JS reading content remain. This is not a scroll-reveal animation or a hiding layer. Other browsers use the existing layout.
3. Add **repeatable Chrome text-only performance instrumentation** across two built routes and desktop/mobile viewports. Inspect picture selection, all five chapters, actual loaded hero, priority semantics, network resources, LCP samples, cumulative layout shift and reduced-motion/JavaScript-disabled states. Guard against unintended full-page eager scene downloads and regression failures.

## Honest measurement policy

Browser timing and LCP vary with the CI machine and network. The measured numbers are diagnostics, **not** production Core Web Vitals claims; the gate focuses on resource contracts and broad transfer budgets, not brittle millisecond thresholds. A truthful field Core Web Vitals assessment requires real visitor telemetry and consent/privacy decisions, which are not configured in this stage.

No screenshots, videos, user telemetry, analytics, new contact endpoints, fabricated reviews or invented clients. Stage 17 aesthetic audit and Stage 18 launch remain separate.

## Measured redundant mobile image, resolved

The first text-only Chrome run (390px on GitHub Actions, local uncompressed test server) recorded about **876 kB** of first-view resources, including both `winding-path-mobile.webp` (~274 kB) and the original independent `winding-path-portrait.svg` (~240 kB). The earlier WebP was completely covered by its SVG painting on mobile. That was needless transfer, not an aesthetic requirement.

The final mobile-specific CSS therefore stops displaying dormant WebP fallback layers when JS is active. Unlike `visibility:hidden`, `display:none` alongside native `loading=lazy` allows Chrome to defer their network fetch. The static HTML raster assets are **not deleted**; no-JS users receive them as before, and a small `error` listener in the established main module restores them when the independent SVG artwork fails. Dedicated mobile SVGs remain the primary illustrations. This can eliminate near-viewport duplicate transfer while preserving chapter content and explicit fallback behavior.

The Stage 16 script verifies mobile initial-network composition: the original covered mobile WebP should not load while its native illustration successfully decodes. Results and actual bytes are recorded in text logs; any claimed improvement is scoped to that test environment, not field users.
