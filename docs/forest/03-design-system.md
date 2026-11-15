# 03 — Design System & Semantic UI

**Date:** 2026-11-15 (Asia/Jakarta)  
**Scope:** Stage 03 ONLY; main website and nested \`/storybook/\` use the same complete editorial shell.

## Visual system: Apple quality discipline, NOT Apple appearance

Master authority is the original **The Forest Between Pages V2**, not a collection of generic illustrations.

### Tokens implemented

| Token | Value | Application |
|---|---|---|
| Forest | \`#244F3B\` | Primary text, buttons, structural rules |
| Ink | \`#273829\` | Reading copy |
| Paper | \`#F7E9D6\` | Main surface |
| River | \`#5A8CAF\` | Decorative illustration only (future assets) |
| Sun | \`#F3C354\` | Accent/selection only |
| Clay | \`#D86A4A\` | Decorative illustration only |
| Berry | \`#8B6CA8\` | Decorative illustration only |

- On Paper, Forest and Ink meet WCAG AA for normal text. Accent colors are NOT used for 14px reading copy.
- Reading: **Newsreader**, responsive 17–19px; display baseline: **Fraunces**; interface: **Atkinson Hyperlegible** with safe fallback families. Custom illustrated lettering remains a separate art deliverable.
- CSS code lives in \`src/storybook/styles/tokens.css\` and \`chapters.css\`. No gradient pills, noise-overlay cards, fake vector leaves or imported stock forest icons.
- Deliberate typography, warm paper surfaces, large quiet drawing areas, fine editorial rules and distinct chapters are the only visual material at this stage.
- Primary controls and navigation targets are designed at least 44×44 CSS pixels; accessible focus ring; reduced motion support.

## Five chapter compositions and actual functionality

1. **Entrance:** confident studio positioning, an accessible H1 and two actual native-anchor CTAs; drawing mount reserved on the right (below copy on mobile).
2. **Winding Path:** service-list spread and an explicit *proposed working rhythm* editorial note. No false claim about a certified workflow.
3. **Work Clearing:** three naturally keyboard-operable native \`details/summary\` folios. All named concepts explicitly declared **not client commissions**. No fake case-study URLs.
4. **River Stories:** independent editorial notes with explicit unpublished-outline disclosure; no dead article links.
5. **House on the Hill:** studio-first manifesto and transparent contact status. No fake send/submit CTA is introduced without a verified backend.

## Navigation and progressive enhancement

- Native links for all five chapter IDs; header, footer, direct work and start links.
- Skip link is first focusable element and reveals on focus; semantic \`main\`, \`section\`, \`h2\`, \`nav\`, \`details\` markup even with JavaScript disabled.
- Mobile menu toggle has \`aria-controls\`, \`aria-expanded\`, Escape-to-close, outside-pointer close, close-on-activate and focus return; without JS, mobile menu remains visible.
- \`aria-current="location"\` updates as user moves between chapters without scroll hijack.
- Real content is in HTML for no-JS reading. JS hydrates approved narrative plain text via \`textContent\`, preserving intentional editorial breaks in headings.

## Responsive audit cases

320×720, 375×812, 390×844, 430×932, 768×860, 1024×768, 1440×900, 844×390 (short landscape) are tested on the built root **and** secondary storybook route. Scroll layout is native. No forced cinematic animation, mobile crop or unresolvable anchors.

### Stage 03 browser audit

CI checks: no JS / local HTTP error; one H1; exactly five section landmarks in contract order; valid native anchors; visible-control hit area >=44×44; no overflow; no legacy canvas; three explicitly marked concepts; sampled normal text contrast >=4.5:1; opening native \`details\`, mobile menu + Escape + link behavior, reduced motion, and keyboard skip link. Screenshots are captured from the actual built page.

### Deliberate deferred work

- **Artwork:** art mounts are clean space reserved for independent genuine crayon layers; not illustrated in Stage 03.
- **Characters:** Paperkeeper construction / limited animation belongs to Stage 05 / 11.
- **Story movement:** scene-to-scene transitions belong to Stage 12.
- **Contact workflow:** no verified direct channel currently exists. The copy-only brief may be implemented later in Stage 13.
- **Originality:** stage 17 human editorial art audit and future stage 15/16 full accessibility/performance measurements are NOT replaced by this DOM QA.
- **No fabricated client work:** Atrium, Oracle, Archive remain concepts.

Stop after Stage 03. Do not make original illustrated assets, move to Stage 04 or implement character animation without a new user instruction.
