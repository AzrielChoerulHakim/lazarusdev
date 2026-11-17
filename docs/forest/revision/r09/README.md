# R09 — Canonical source release

Date: 17 November 2026.
Promotion: fast-forward the reviewed `feat/r02-entrance` revision series onto `main` **only after** the R08–R09 build/browser/Stage18 workflow proves green on the branch.

## Publication scope

1. Preserve five real chapters, native navigation, accessible Field Atlas and note controls, source-provenance distinctions, the non-indexed nested duplicate and the single canonical sitemap.
2. Replace OG/Twitter preview image with the actual R02 Entrance desktop asset (1536×1024 WebP). Retain the leaf cue favicon.
3. Run asset-integrity checks, root and storybook builds, production-route R08 integration tests, R04 character QA, and Stage18 canonical metadata/sitemap checks. The main-push workflow repeats the same release gate.
4. On success, fast-forward `main` from `8e6b0cf` to the revision head, keeping ordinary commit history. Do not force-push or create fake success attestations.
5. Record the final pushed SHA and workflow outcomes only when GitHub returns those values.

## Honest handover limitations

- R05's full independent landscape/portrait painting replacement and anatomically authored gestures for Chapters 02–05 are **not yet delivered**. Decorative new chapter engravings and finite ink cues are not substitutes.
- Art direction R07 has not been manually, visually certified on real final rendered pages; tests prove functional correctness only.
- Field Letter prepares a local text brief; it does not send messages. Public email/inquiry delivery remains blocked until verified.
- GitHub Pages propagation is dependent on repository Pages settings. A push to `main` is not, by itself, evidence that the public URL has updated.
- No automated screenshots, videos or recordings were generated.

This handover allows a truthful incremental production release, not a claim that incomplete artistic deliverables are finished.

## Stage16 corrective gate

Reduced-motion cold-load image decoding must not race with R04 frame replacement. The release acceptance sequence now includes `scripts/forest_performance_smoke.mjs` on the current commit. This is an actual performance/decoding regression guard rather than a claim of real-user Core Web Vitals.
