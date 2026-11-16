# Stage 10 — House on the Hill / a place to return to

**Scope:** Chapter 05 only, finishing the five-scene site narrative. Master V2's last miniature depicts a warm lamp-lit cottage high on a winding hill, not another corporate about-section template.

## Editorial and art choice

The scene is a **purpose-generated, AI-assisted digital colored-pencil illustration** of a cottage on a rising mossy hillside with a visible river valley, gnarled framing canopy, flowering rocks, winding path and warm windows. It is a digital illustration with hand-drawn-like directional hatching, **not a physically painted handmade canvas**. No source image is cropped from the flattened Master V2 board; no full-page image-generation mockup is used as the site's background and no raster typography exists in the production scenery.

A separate existing Stage 05 Paperkeeper character is placed as an actual transparent cutout over the illustration. A glow overlay aligned to the original window panes is exported as an independent alpha WebP for both responsive sizes. Only an intentional button press brightens the windows; the effect never loops or flashes, and reduced-motion users receive an immediate static state. The design deliberately places the interactive control in a paper caption **outside** the illustration, never on top of the house or content.

Asset manifest: `storybook/assets/house-on-the-hill/manifest.json`; `source/house-crayon-source.webp`; `exports/house-desktop.webp`, `house-mobile.webp`, `window-glow-desktop.webp`, `window-glow-mobile.webp`. PNG creation output was used to construct the archived compressed WebP source. The **mobile background is an intentional crop centered on the cottage**, not an independently rendered portrait. This is a known Stage 14 illustration refinement, not mislabeled as native artwork.

## Real About + honest contact

All Stage 01 canonical heading, lead and manifesto remain accessible *as HTML* in Chapter 05. Founder identities remain anonymous. Studio work and independently produced digital products remain separate directions; no fake client successes, external case studies, testimonials, email addresses or offices were invented.

No verified public inbox, email, endpoint or contact number is known from project sources. The project therefore **does not claim to send a message**. Instead, `#studio-inquiry` is an addressable and navigable minimal local-only project note: a labelled `textarea` (4000 characters), visible disclosure, and an opt-in **Copy my project brief** action which uses Clipboard API or a manual selection fallback. Copying never submits/uploads/stores a draft; users must later use a separately verified channel to deliver it. The copy function is *not* a working lead-delivery system. Stage 13 may add a verified channel and more comprehensive conversation flow once actual contact information is supplied.

With JavaScript disabled or illustrations unavailable, the heading, manifesto, typed note and manual copy route remain usable. Window interaction is hidden without JS. Real anchors return to Entrance and Work and point to the actual note section. No scroll hijack or route spoofing.

## Verification contract

`forest_house_audit.py` checks five WebP outputs with exact hashes, opacity modes, dimensions, maximum size, and both semantic HTML routes.

`forest_house_smoke.mjs` checks 8 viewports × 2 compiled GitHub Pages paths; successful decoding for the responsive image/alpha window/Paperkeeper cutout; independent light-toggle opt-in and keyboard operation; visible status; copy-only text and zero-network semantics; no horizontal overflow; 44px targets; reduced-motion transition removal; and no-JS/no-image fallback. **No browser screenshots are captured**; only a text test log and asset manifest may be published as CI artifacts. Older regression workflows have their own independent QA.

**Stage boundary:** House on the Hill is the fifth complete illustrated chapter, not the end of the full roadmap. Stage 11 limited Paperkeeper motion, Stage 12 scene continuity, Stage 13 stronger verified conversion, Stage 14 independently composed mobile artwork, Stage 15 accessibility, Stage 16 performance and Stage 17 human anti-generic editorial scoring remain separate work. CI cannot certify artistic originality.
