# 05 — Character Bible: THE PAPERKEEPER

**Lazarus Dev / The Forest Between Pages — Character System V1.0**  
**Date:** 15 November 2026 (Asia/Jakarta)  
**Scope:** Stage **05 only**. No homepage scene implementation, completed animation or Stage 06 work.

## 01. Character identity

**The Paperkeeper** is a quiet, curious keeper of stories, the same little figure guiding visitors through five distinct chapters of Lazarus Dev. It should appear as an unusual woodland messenger, **not** as a customer-service mascot, chibi cartoon, human in a green costume, or smooth vector character.

**Role:** witness, narrator, page collector, discreet wayfinder. It offers orientation; it does not become the primary CTA or gate access to content. All information and action labels remain in semantic HTML.

**Temperament:** observant, gentle, slightly shy, purposeful; a little strange but never saccharine. Emotion is communicated chiefly by body orientation, lantern position and leaf-hat tilt, not large expressive eyes.

**Visual master:** `docs/forest/ART-DIRECTION-LOCK.md`, approved V2 masterboard. The V2 drawing shows the asymmetric leaf hat, pale nearly featureless face, tiered leaf/moss cloak, twig legs, cream paper satchel with leaf stamp and amber acorn lantern. These are non-negotiable invariants.

## 02. What is locked, and what is not

The Stage 05 **turnaround V1** provides a consistent interpretation with four separate views, unlike separately improvised assets per chapter. The full-resolution reference sheet is in `storybook/assets/characters/source/paperkeeper-turnaround-source.webp`; the exported transparent WebP figures are in `storybook/assets/characters/`.

| Feature | Non-negotiable rule | Visual check |
|---|---|---|
| Hat | One broad asymmetric ochre-green leaf brim, tilted laterally, with a small crown sprout and curling leaflet | Must remain the clearest silhouette landmark even at 72 px |
| Face | Round/oval cream face, two small dark dots, no giant glossy eyes | Readable at ~100 px but not dependent on expression |
| Cape | Three irregular overlapping tiers of darker moss leaves, light yellow-green highlights and directional crayon hatch | Must not be a uniform repeated scallop or flat SVG fill |
| Body | Tiny torso under cape; slender brown twig-like legs, small worn feet | Keep the gait grounded; current V1 boots are visibly more substantial than the master, so tone down in final chapter art |
| Satchel | Cream paper envelope-shaped satchel, one simple stamped leaf mark, warm brown shoulder strap | Cross-body placement consistent under rotation |
| Acorn lantern | Hand-held amber-gold acorn-frame lantern; gentle warmth | Light is a restrained accent, never an animated glow covering copy |
| Silhouette | Asymmetric top mass, tapered irregular leaf body, two fine legs | Distinct at thumbnail size without color |

This is a **digital illustration with hand-rendered colored-pencil/crayon appearance**, not a claim of physical pencil-and-paper authorship. It was created with image-generation assistance based on the owner-approved design direction and subsequently matted/edited for reusable assets; the masterboard was **not** cropped to fake layers. Preserve source attribution honestly.

### Internal colors

V2 core: Forest `#244F3B`; Paper `#F7E9D6`; Sun `#F3C354`; Clay `#D86A4A`; Ink `#273829`. Natural pigment variation in the rendered character is allowed; new arbitrary neon accents are not. The robe uses Forest + darker moss + uneven ochre/gold leaf highlights; the bag remains bone/cream; the lantern is warm rather than blue-white.

## 03. Turnaround and scale

Four **separately usable RGBA WebP exports**, displayed at the same visual height:

1. `paperkeeper.front.webp` — frontal, hat tilted left, both dot eyes, satchel and lantern.
2. `paperkeeper.three-quarter.webp` — working primary reference for character posing.
3. `paperkeeper.profile.webp` — elongated asymmetric leaf brim, layered cape viewed sideways.
4. `paperkeeper.back.webp` — leaf crown and tiers, bag strap around the back, lantern readable from behind.

Each is ~393–431px wide and ~648–661px high. The four exported files each have transparent backgrounds, independent image URLs and SHA-256 provenance. They originate from a **purpose-produced** turnaround source sheet, not pieces cut from the original forest masterboard.

**Reference height (subject to scene-specific art review):** desktop hero around 280–370 CSS px, mobile around 150–220 px, small supporting world cue around 72–112 px. At 48 px, the hat/cape silhouette may be used *decoratively only*; do not place essential directions, buttons or labels inside that tiny character image.

**Black silhouette test:** `paperkeeper-silhouette.webp` (4 side-by-side angles) is a QA artifact. A consistent dominant crooked hat, leaf-cape contour and twig legs are visible across all four angles; the illustration must not be identified merely by green pigment. `paperkeeper-small-scale.webp` verifies that the same four sprite sources remain visually coherent at a miniature size. Do not treat those QA atlases as production scene backdrops.

## 04. Acting language — static keys, NOT animation yet

Stage 05 contains five *reference pose* exports from a second purpose-created action source sheet. They are **small (about 64–148 px wide)** and therefore are not polished hero-size or final animated frames:

- `paperkeeper.walk-a.webp`, `paperkeeper.walk-b.webp`, `paperkeeper.walk-c.webp` — light step sequence, modest cape sway and tiny body lean. No slippery float. These are *visual keys*, not a running CSS sprite loop.
- `paperkeeper.read.webp` — still reading a small field journal. The head lowers under the leaf brim.
- `paperkeeper.rest.webp` — momentary rest, tiny figure tucked beneath the hat.

**Future motion constraints (Stage 11 only):** limited hand-drawn timing around 8–12 unique frames/second as appropriate, no infinite decorative dancing, no mechanical spine rig, no scroll hijacking, respect `prefers-reduced-motion`. These instructions do not authorize animation now.

### Expressions

Use tiny pose/hat/lantern adjustments instead of oversized eyes or new faces. Define six *intent notes*, not yet six finished production sprites: attentive (neutral), curious (small forward head angle), pleased (hat rises a fraction), surprised (lantern pauses), thoughtful (head lowers to page), resting (cape gathers). Do **not** imply these expression exports have already been created at full resolution.

## 05. Supporting cast — strict limit of TWO

- **Moth guide:** `moth.guide.webp`. A muted cream/ochre speckled moth, serving wayfinding cues only. Its future motion may be one short wingbeat, never a long autonomous showpiece. If the moth marks a navigable destination, the real HTML link/button must expose text and focus.
- **Roundbird:** `roundbird.idle.webp`. Small, low-detail russet-breasted bird, used for occasional tiny environmental acknowledgments. It does **not** perform endless bounce loops.

**Rejected and not canonical:** rabbits, squirrels, foxes, hedgehogs, frogs and other experimental animals that appeared on intermediary exploratory design sheets. The source-action canvas is preserved for provenance but only moth and roundbird are exported and promoted as approved supporting characters. Future chapters must not silently add companions or redesign the Paperkeeper.

## 06. Five-chapter presence plan (not implemented)

| Chapter | Intended character function | Expression/gesture direction |
|---|---|---|
| Entrance | Greets and orients beside the forest gate | Static three-quarter view, lantern low, space left for H1 |
| Winding Path | Guides toward the next section | Light walk, a short unhurried step |
| Work Clearing | Helps visitors discover works | Looks toward one hanging page, never replacing its link |
| River Stories | Observes, reads and records | Seated reading pose on a quiet stone |
| House on the Hill | Signals arrival / invitation | Quiet rest near the threshold, lantern as warm accent |

No chapter-specific artwork or animation controller has been produced in Stage 05. Chapters 06–10 will each require their own scene assets, including actual layered environment images as specified in Stage 04.

## 07. Provenance and production caveats

- `source/paperkeeper-turnaround-source.webp` — compressed character-specific turnaround source from image-generation-assisted art process; no other characters.
- `source/paperkeeper-actions-source.webp` — exploratory action/cast sheet; **noncanonical extra figures remain only in unlinked source**, rejected from exports.
- `manifest.json` — asset file names, dimensions, SHA-256 fingerprints, alpha extrema, source boxes, provenance. Its hashes refer to the already committed WebP bytes, not a hypothetical future export.
- `scripts/forest_character_export.py` — explicit crop/matting/re-export recipe (requires Pillow, NumPy, OpenCV). Different library/WebP encoder versions may produce different byte hashes; compare regenerated images visually and structurally, then intentionally version the manifest if artwork changes.
- `scripts/forest_character_audit.py` — deterministic validation of committed manifest/asset bytes and shape constraints. It is not a substitute for art-direction signoff.
- `storybook/character-lab/` — responsive standalone reference gallery and angle control, **not** the completed website hero.

Do not call the assets hand-painted or attribute them to a human illustrator. Preserve copyright/usage provenance of the actual generated outputs and independently authored modifications.

## 08. Apple-inspired usability quality gate

- Every view selector is a real button with `aria-pressed`, visible focus, and at least a 44×44 CSS px hit target.
- A meaningful alt description changes when a visitor changes the angle; no information exists only inside a picture.
- Mobile view is not just a crop of the larger figure; the responsive *layout* changes the character's position and space around text, while the underlying static cutout can be re-used.
- Avoid continuous animation, flash, page-jumping, or forcing visitors to watch turns. Current control swaps static source images immediately.
- All five site chapters and the main site's native navigation must remain usable without entering this Character Laboratory.

## 09. Stage 05 acceptance and editorial issues

| Gate | Status | Basis |
|---|---|---|
| Same protagonist through front/three-quarter/profile/back | PASS — technical/visual baseline | Four source-consistent views |
| Distinct hat/cape/carry-item silhouette | PASS — reference inspection | Silhouette atlas + scale test |
| Transparent reusable exports with provenance | PASS — automated | Alpha/size/hash audit |
| Only moth and roundbird published as companions | PASS — file manifest | Only two support exports |
| No generic vector/chibi mascot | PASS — initial visual direction review | Directional pencil marks and small-dot eyes; not final human signoff |
| Full-size production action animation | **NOT IN STAGE 05** | Stages 11 and chapter art required |
| Final hand-crafted crayon scene integration | **NOT IN STAGE 05** | Starts at Stage 06, subject to art review |

**Known V1 improvement notes:** Boots are slightly bulkier than the original master reference; reduce the apparent shoe mass in later hero artwork. Some walking thumbnails lack the fidelity of the large turnaround; they must be **redrawn as coherent full-resolution frames** before any Stage 11 animation. Keep the moth/roundbird restrained and the facial eyes small.

**Stage boundary:** Stop after Character Bible, assets, laboratory and QA. No Entrance implementation, scene motion or new business interactions until explicitly requested.