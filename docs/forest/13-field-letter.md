# Stage 13 — The Field Letter / Inquiry and conversion without a fake inbox

**Scope:** A more useful opt-in studio inquiry interaction on both published routes, within the existing House on the Hill paper note. Not Stage 14 mobile art or a new form backend.

## Decision and boundaries

No verified public Lazarus Dev email, messaging endpoint, phone number, or CRM exists in the reviewed project sources. A site that claims to receive inquiries in these circumstances would be dishonest. The conversion goal is therefore to help a prospective client **prepare a clear, portable brief** and navigate directly to the editor; **successful lead delivery is not yet possible**. Connecting an approved delivery channel remains an explicit outstanding dependency on the studio.

The top navigation's existing quick link now leads to `#studio-inquiry` as **Draft a project note**; the original Work navigation and chapter remain available.

## Original editorial treatment

A restrained **field register** is woven into the Chapter 05 cream paper, using numbered entries and a margin rule rather than generic SaaS cards. The visitor can identify a distinctive website, interactive experience or digital product; optionally state the outcome and choose timing; then write the actual note. The canonical manifesto and all five scene compositions remain unchanged.

The existing **Copy my project brief** now exports these selected details plus the visitor's own note. A separate **Save the letter as .txt** action downloads the complete plain-text brief locally. A native disclosure titled **Read the complete letter** shows the exact content before copying. No storage, cookies, analytics, fetch request or automatic submission is implemented.

The note remains mandatory for copy/save; form choices alone cannot create an empty lead. With JS disabled, the original accessible textarea and manual copy path remain visible. Optional enhancements are hidden. Clipboard permission failure falls back to copying the entire assembled letter via an ephemeral offscreen textarea; if unavailable, the completed letter remains visible for manual selection and local export. All outputs end with: `Draft only. Not submitted to Lazarus Dev.`

## QA

Two built GitHub Pages routes, eight viewports including 320px, visual overflow, live selection and review consistency, native keyboard operation, copy and download semantics, zero POST requests, no JS, reduced motion and unchanged five-chapter contract. CI is text-only: **never capture screenshots or video**.

Stage 13 prepares the conversation. It **does not send a lead** without a verified channel, and must not be advertised as a complete online contact form. Stage 14 remains separate.
