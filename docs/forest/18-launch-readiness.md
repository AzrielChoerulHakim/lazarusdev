# Stage 18 — Public website launch / release evidence

**Release target:** https://azrielchoerulhakim.github.io/lazarusdev/

**Canonical root:** `/lazarusdev/` — public and indexable.
**Legacy alternate:** `/lazarusdev/storybook/` — deliberately `noindex,follow` with the same canonical link.
**Scope:** honest public metadata, link-preview asset reuse, one-route sitemap, stable production QA, updated handover documentation, and deployment verification. No screenshots, new fabricated work or unverified contact destination.

## Ship decisions

1. Change the root from `noindex,nofollow` to `index,follow,max-image-preview:large`, following the user's explicit instruction to execute launch Stage 18. Do not index the duplicate `/storybook/` entry.
2. Both HTML entries declare the **same canonical URL**, site identity, OG and Twitter metadata. Share image reuses the original published Entrance background asset, **not an artificial screenshot**. The original small hand-drawn leaf cue becomes the favicon. These are links to files already present in GitHub Pages, not claims that any platform will necessarily render the preview.
3. Publish `public/sitemap.xml` containing the canonical root only. Vite copies `public/` assets to its output. For GitHub Pages project sites, a `robots.txt` inside `/lazarusdev/` would not be authoritative for the entire `azrielchoerulhakim.github.io` host; this release therefore relies on page-level robots metadata and a sitemap, **not a misleading project-level robots policy**.
4. Replace stale README statements describing Stage 03 scaffolding and screenshot uploads. Real current design and honest limitations are documented.

## Public truth checklist

- Five distinct illustrated chapters: shipped.
- Atlas and live specimen: shipped; three other folios remain explicitly concept only.
- Native anchors, keyboard and reduced-motion behavior: audited by previous stages; Stage 18 checks metadata, links and file availability.
- Field Letter: local copy/download only; **no verified public lead-delivery mechanism**.
- Final human art-direction acceptance: **not certified**, in particular scripted SVG mobile paintings versus AI-assisted raster desktop paintings. Automated CI cannot award the lock file's subjective 4/5 criterion scores.
- Search Console verification / indexing confirmation: **not performed**. `index,follow` enables eligibility, not search placement.
- Social preview validation on each external platform: **not performed**. WebP support varies.
- Domain: repository's public GitHub Pages project URL only; custom domain not established.

## Technical release gate

A new Stage 18 workflow builds both route outputs, checks root/duplicate metadata, the canonical sitemap, published image and favicon URLs, live fragment destinations, no false send behavior, no-JS content, and a mobile/desktop browser smoke without capturing a screenshot. Prior Stage 03 and 06–17 workflows must pass on the same feature SHA before promoting `main`. Finally verify the production Pages workflow and all regressions on the promoted SHA.

## Distinguish the two meanings of launch

**Public website launch** can finish once canonical indexing, metadata, build and deployment gates pass. **Full commercial/contact readiness** remains blocked until the owner supplies a verified inbox/endpoint and approves the artistic output. Do not call the Field Letter a submitted inquiry or claim an aesthetic sign-off.
