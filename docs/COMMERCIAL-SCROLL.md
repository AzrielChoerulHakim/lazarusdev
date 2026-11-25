# Commercial scroll integration

Design OS selection: S04 Sticky Evidence Exchange + S02 Scroll-Synced Chapter Index, two mechanisms total. Decision recorded in scroll-plan.json before implementation. No independent Reference Engineering plan or other runtime scroll mechanism exists on the commercial root; archived storybook is outside this scope.

The S04 evidence panel is a typographic adaptation: it shows actual ordering inputs and deliverables, not a fictitious project status or a borrowed graphic. The underlying seven steps remain visible in order. S02 reuses the only existing navigation; its active link follows the reading position, not a separate URL clock. Native fragments retain history. One event-coalesced requestAnimationFrame callback reads geometry, never starts a perpetual loop; no external runtime or image added.

Desktop enhancement requires width >=1100 and height >=720 CSS px, normal motion preference, and sufficient measured header/panel space. Mobile, short screens, reduced motion and no-JS retain the full ordered SOP without pinning. The panel is supplemental visual content hidden from assistive technology because the equivalent SOP is in the document. No SVG or arrow decoration. Prices, contacts, legal clauses, calculator and all order steps remain intact.

QA: CI includes the pinned Design OS decision validator and browser tests for reverse scroll, stage label synchronization, active fragment navigation, browser back, mobile/reduced-motion fallback and existing commercial functionality. Release gate is NOT claimed passed: actual CI result, per-section human screenshots, physical phone, text zoom/spacing and performance evidence remain to be reviewed; scroll-plan QA entries intentionally not-tested.
