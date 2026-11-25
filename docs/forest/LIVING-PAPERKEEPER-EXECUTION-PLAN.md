# Living Paperkeeper & Scroll Story — execution plan

Date: 23 November 2026 (Asia/Jakarta)  
Repository: AzrielChoerulHakim/lazarusdev  
Target: main, direct GitHub commits  
Audited baseline: 20f565280a0c4c21a5b903624ec28bc9012e7dec  
Status: AUDIT + PLAN ONLY. This document does not implement the proposed runtime, artwork, or QA.

## 1. Outcome

Make Paperkeeper feel like one inhabitant moving through the whole website: painted landscape, paper margins, chapter transitions and meaningful visitor interactions. Upgrade the Halfmile-inspired scroll storytelling so that visitor movement reveals connected events with consequences.

Keep the approved Forest Between Pages identity: tactile 2D colored pencil/crayon, original Paperkeeper silhouette, moth and roundbird, five existing chapters, editorial typography. Preserve direct access to services, work and project-note controls.

## 2. Evidence and current workflow

Sources read directly from GitHub at the audited commit:
- README.md; docs/forest/V3-NARRATIVE-EXECUTION.md; ART-DIRECTION-LOCK.md.
- VISUAL-REVISION-EXECUTION-PLAN.md; 05-character-bible.md.
- revision/r15/README.md; revision/r15a/README.md, PAPERKEEPER-ASSET-RECONSTRUCTION.md, ANCHOR-MANIFEST.json and evidence/manifest.json.
- index.html and the active source modules, CSS, V3 browser gate and workflow, R15A browser workflow.
- The supplied halfmile-landing.html reference was read as reference only; no duplicate project was built.

Production website was inspected through a desktop browser at a 1363x936 viewport, including native scrolling, chapter anchors, Entrance, transition margins, Winding Path and River. This is not a physical mobile-device assessment or exhaustive visual sign-off.

Current implementation:
1. main is the canonical source; root index.html and storybook/index.html publish the same narrative with different URL metadata.
2. Vite builds root and alternate route separately; GitHub Actions serves a Pages-shaped mirror for Chromium tests.
3. V3 adds selective sticky scenes, camera movement, progress notes and SVG seam tracing. Character and control modules retain separate state.
4. Active HTML imports include main.js, entrance-acting-integration.js, keeper-journey.js, chapter-attention.js, paper-rescue.js, narrative-director.js and the work/river/house/Atrium control modules.
5. automatic-motion.js, paperkeeper-motion.js and forest-seams.js exist historically but are not directly imported by the inspected production HTML. Do not mistake repository presence for active behavior.
6. The R15A workflow can commit generated screenshot evidence back to main. Re-read branch HEAD before every write because bot commits may advance it.

Observed CI:
- Pages run 44948148832: success on 20f565280a0c4c21a5b903624ec28bc9012e7dec.
- V3 run 44948093958: success on c9e6c8559a9d2762f67f5296788b9d05600a1266.
- The checked-in R15A evidence manifest identifies sourceCommit c6311b1a2d7c87ffe16b47ad414ad9fa12cb05da. Its evidence must retain that identity; it is not newly captured evidence for this plan.

Documentation drift:
- Older roadmap status still calls R15/R15A and later work planned.
- R15A README says hand-specific story poses remain to be drawn, whereas the current anchor manifest lists five new story drawings and the current CSS uses narrative-journey-r15a.webp.
- V3 is already implemented, so do not rebuild it from an old roadmap.
- Asset existence and automated checks do not establish visual approval. Audit actual drawings before deciding which need refinement.

## 3. Findings to fix

### F1 — Two progress models break character/camera synchrony

narrative-director.js computes desktop pinned-scene progress from the scrolling wrapper. keeper-journey.js computes character travel from its parent painting's viewport rectangle. That painting is sticky, so its top stops changing while the wrapper continues to scroll.

Reproduced in the live Winding Path:
- At scrollY 3136: wrapper progress 0.3828; painting top 37.4375px.
- At scrollY 3370: wrapper progress 0.7559; painting top still 37.4375px.
- In both states the walker retained translate3d(756.492px,-384.248px,0), scale(0.622,0.622) and the stand frame.

The camera progresses while the walker has already arrived. Fix the shared progress contract before adding choreography.

### F2 — Paperkeeper is repeated rather than continuously staged

The HTML contains four scene walkers, four seam walkers, a large Entrance figure and an Atlas acting figure. Walkers are positioned relative to individual containers; path art and Entrance use clipping. Seam figures occupy small bounded areas.

The desktop inspection shows a large guide in the Entrance, another figure on the Atlas, then a very small seam walker. These are not a convincing visual handoff of the same character.

### F3 — Scene labels are not causal storytelling

V3 notes such as THE CROSSING and THE ACT OF CARE are derived from scroll progress independently of actual gestures. paper-rescue.js begins a roughly 1.94-second sequence after visibility thresholds and a delay. A note can describe a different beat from the character's action.

The motion path, event clip, prop ownership, short narrative sentence and light should describe the same event.

### F4 — The rescued page is not yet one controlled narrative object

River DOM page, paper inside rescue sprite drawings and the House window page are separate representations. CSS hides duplicate props during lift/carry; House's page is already present without shared rescue state. The River painting also visibly includes background paper shapes.

Use one canonical narrative page identity and explicit ownership through water -> hand -> satchel/carry -> window. First audit which paper shapes are baked into raster/SVG art; CSS cannot remove a painted duplicate from a flattened background.

### F5 — Mobile behavior and breakpoints need one contract

CSS unpins at <=670px or <=650px height; narrative-director.js treats <=760px or <=650px height as compact. Widths 671–760 can therefore remain sticky while receiving the unpinned progress calculation. Add regression coverage at 670/671/760/761 rather than testing only a phone and large desktop.

Mobile hides several V3 beat labels. Essential story meaning must be ordinary readable HTML, not exclusively changing aria-hidden labels.

### F6 — Cast and state lifecycle need deliberate integration

Moth and roundbird are the approved supporting cast. Their current production placement is primarily decorative. chapter-attention.js gives finite environmental feedback but does not provide one coordinated character performance.

paper-rescue.js has timers independent of the scene director and no visibilitychange/pagehide cancellation. keeper-journey.js has its own frame scheduling and settling timer. Consolidate active ownership and cleanup; do not add another competing scroll system.

## 4. Story direction

Working premise: A small guide helps an unfinished idea find a home.

Retain the existing five places. Make the visitor's passage connect them:

| Chapter | Visible event | Visitor relationship | Consequence |
| --- | --- | --- | --- |
| Entrance | Paperkeeper notices arrival, raises the lantern, steps out of the illustration onto a drawn margin path | Opening the existing Atlas earns a short acknowledgment; scrolling begins the departure | The same guide starts the journey |
| Winding Path | Moth indicates a turn; Paperkeeper follows the authored trail and pauses near meaningful service content | Slow scroll reveals deliberate steps; stopping lets him settle; reversing produces a small turn | His gaze and route lead toward the work |
| Work Clearing | Paperkeeper reaches the paper edge beneath the hanging studies, looks toward the selected folio | Existing folio opening triggers a finite look/lantern response; Atrium owns focus and pauses outside acting | A paper motif and the transition introduce the river event |
| River Stories | Roundbird notices the torn page; Paperkeeper approaches, sets down the lantern, reaches and lifts | Scroll reveals the approach; once contact begins, the short lift completes naturally even if scrolling pauses | A recognizable page is now carried onward |
| House on the Hill | Paperkeeper arrives with the page, leaves it near the warm window, then rests near the writing area | The light button remains user-controlled; focusing the project note produces at most one subtle acknowledgment | The rescued page is safe; a clean page is offered to the visitor |

Example short copy, to refine with timing:
- Entrance: "A little light. A way in."
- Path: "Every turn begins with a choice."
- River: "Some ideas only need someone to stop."
- House: "A place for the unfinished. A page for what comes next."

The website converses through action, pacing and a few sentences. Do not add a chatbot or verbose speech bubbles.

Halfmile reference lesson: its clock, delivery status and route make the same journey legible through coordinated progress. Apply that relationship to Paperkeeper, the page, the landscape and the narrative beat. Preserve Lazarus's own world and native-scroll interaction.

## 5. Runtime architecture

### One narrative coordinator

Evolve narrative-director.js and narrative-math.js. Add a small declarative story-beats.js only if needed to keep scene timing, anchor routes and mobile variants readable.

The shared snapshot should contain:
- chapter and scene progress;
- scroll direction with a small dead zone to prevent flicker;
- layout mode from the same breakpoint contract as CSS;
- current beat and visited/committed events;
- actor pose, destination and facing;
- page ownership/state;
- active interaction and reduced-motion/visibility status.

One passive scroll listener and one scheduled requestAnimationFrame for narrative work. Existing business controls keep their normal event listeners. Read relevant geometry first, calculate second, write transforms last. Observe resize, image decode, font loading and details expansion so cached geometry stays valid.

Explicit property ownership:
- Coordinator: progress, beat and committed story state.
- Character renderer: position, facing and pose.
- Scenery renderer: camera and environmental light.
- Native controls: expanded/open/pressed values, focus, text input and dialog state.
- Prop renderer: canonical page position and visibility.

There must be only one writer per animated property. Remove conflicting old inline pose writes and CSS overrides as each responsibility migrates.

### One active Paperkeeper across the page

Create one lightweight actor layer outside the painting's clipping containers. It follows authored ground anchors in scene and margin coordinate spaces. On the enhanced route, replace visible duplicate walkers with this actor only after the actor's assets are decoded successfully.

Keep source fallbacks usable when JavaScript or assets fail. An Atlas print may remain as an explicitly static illustration if composition needs it; it must not look like a second independently acting protagonist.

Implementation rules:
- Convert scene anchors to the actor layer's coordinate space using measured viewport/document geometry and camera transforms. Do not add scroll offsets twice.
- Use normalized foot and hand anchors; retain the existing frame baseline contract where applicable.
- Author exit, margin and entry anchors across all four seams.
- Preserve scale gradually through each handoff. Do not abruptly shrink a hero into a tiny crossing icon.
- Clip the landscape independently. Character escape requires structural separation, not globally changing every overflow to visible.
- Keep optional foreground occlusion deliberate and local; a separate actor layer must not put the character indiscriminately above every tree.
- Define safe routes around text, links, sticky navigation, folio controls and form inputs.
- A deterministic safe resting anchor is the fallback when a layout has no room for travel.
- On deep links and fast jumps, initialize at the appropriate destination state without racing visibly across intervening content.
- Suspend or hide the external actor while Atrium is open; restore the exact narrative state on close.

### Responsive performance and interaction

Desktop: longer margin routes, modest camera motion, occasional gaze toward a relevant hovered or focused control.

Mobile: shorter authored routes around illustrations and section edges; visible gestures on touch/focus; normal page flow on narrow/short viewports. Do not make a desktop cursor-following interaction the main mobile experience.

Supporting cast:
- Moth: one short move to a route destination, then rest.
- Roundbird: one notice/turn or small hop at the river cue, then rest.
- Keep the established two companions. Draw additional poses only where actual action cannot be conveyed faithfully with current art.

Use existing buttons/links as triggers. An optional direct greeting target on Paperkeeper must be a labeled keyboard-operable button with a >=44px target. The rest of the overlay stays pointer-transparent. Never place an invisible full-page hit layer over reading or native gestures.

### Event policy

| Situation | Required behavior |
| --- | --- |
| Slow scroll | Travel and camera use the same scene progress; walking poses advance by traveled distance |
| Stop | Movement settles; a committed short action may finish, then no continuous frame loop |
| Reverse | Movement reverses with a turn; a completed rescue is not mechanically played backward |
| Revisit River | Replay is armed only after deliberately crossing a defined upstream reset boundary |
| Fast swipe / anchor skip | Resolve to a coherent destination; no queued catch-up performances |
| Hidden tab / pagehide | Cancel scheduled rendering and finite timers; restore a coherent state on return |
| Resize / rotation / restored page | Recompute geometry without resetting meaningful completed events |
| Reduced motion | Static sequential story with the same meaning; no required camera travel or acting |
| No JavaScript / failed asset | Existing semantic content and recognizable static scene remain usable |

Avoid a separate animation scheduler for each supporting character. A finite action may use the shared scheduler until its deadline; the scheduler then sleeps.

## 6. Art and asset policy

Existing journey sheet: 52,962 bytes. Existing story-action sheet: 31,178 bytes. Together: 84,140 bytes before HTTP overhead. This is a useful starting point for a lightweight 2D implementation.

Reuse approved assets where the silhouette, gesture and prop continuity actually work. Inspect sprite contact sheets at normal display size and 200%, over light and dark backgrounds.

Do not:
- infer art quality from a pose filename;
- enlarge 128x144 cells into a blurry hero;
- call the seated reading pose a lifting pose;
- distort whole-body anatomy to fabricate a wave;
- redraw all landscapes when a limited source-derived change is sufficient.

The page has a visible torn-corner identity. If the current carry sprite's page differs from the DOM/window page, choose and implement one compatible art contract. The carrying page may be baked into a pose, but it must share the canonical shape and not coexist with a duplicate floating prop.

If new drawings are required, generate/edit only the identified missing assets against current references, register the anchors, and commit production exports directly to the same repository. Asset preparation is a necessary production step, not a second website implementation.

## 7. Commit sequence on main

Commit names below are proposed. Each stage must be a coherent working change and record the actual source SHA tested.

| Stage | Proposed commit scope | Done when |
| --- | --- | --- |
| 0. Baseline and contract | Record this audit; reconcile current status and asset facts without rewriting historical evidence | Active modules, current poses, obsolete notes and baseline sources are explicit |
| 1. Progress synchronization | fix(narrative): unify scene progress and responsive staging | Sticky Path actually advances the character; 670/671/760/761 behavior agrees between JS and CSS; existing routes work |
| 2. Continuous actor | feat(paperkeeper): connect scene and margin travel | One active guide crosses all four seams with coherent scale/groundline and no clipped silhouette or blocked controls |
| 3. Living interactions | feat(characters): add finite visitor-aware gestures | Atlas, folio, river, light and letter interactions produce appropriate finite reactions; moth/bird share lifecycle policy |
| 4. Causal story | feat(story): connect the rescued page to the final letter | One page identity links river, carry and window; text describes real beats; skip/reverse/revisit policies work |
| 5. Refinement and evidence | test(story): verify responsive continuity and performance | Both URLs, accessibility, browser lifecycle, asset failure, performance and rendered motion evidence pass; stale documentation is reconciled |

Stage 4 includes the remaining intent of R16/R17; Stage 5 includes relevant R18/R19 validation. Do not restart already implemented R15/V3 work merely because the old roadmap says TODO.

## 8. Direct GitHub execution procedure

No duplicate local website, ZIP delivery or later manual upload to GitHub.

For each implementation stage:
1. Fetch current main HEAD and affected files through the GitHub connector.
2. Read any newly added applicable repository instructions. The audited tree contained no AGENTS.md.
3. Prepare one consistent change across JS, CSS, tests and both HTML routes when applicable.
4. Use GitHub Git Data APIs to create blobs/tree/commit with the current HEAD as parent; atomically advance main with expected_sha and without force.
5. If main moved, inspect the intervening changes, reapply the intended edits on that HEAD, and retry. Never overwrite a bot's or user's newer work.
6. Use repository GitHub Actions for installation, build, browser execution and capture. Extend the existing V3/R15A workflows rather than creating a competing deployment system.
7. Expand workflow path filters to cover every changed narrative dependency. Currently the V3 filter does not cover keeper-journey.js or paper-rescue.js, so a green unrelated run is insufficient.
8. Read checks, logs and screenshot/motion artifacts for the exact implementation SHA; inspect the live deployed result.
9. Fix any defect with a normal follow-up commit. If a stage breaks production and cannot be corrected promptly, revert that stage with a normal revert commit; never reset or force-push main.
10. Update the execution ledger with commit, tested source SHA, build/deploy result, evidence and remaining limitations.

Direct-main tradeoff: the currently observed Pages deployment can run after a push before all independent QA workflows finish. Do not claim pre-merge or pre-deployment protection that does not exist. Use small complete commits and immediate verification. A deployment dependency change, if introduced, must be verified against the actual Pages configuration.

Documentation-only commits do not justify claiming application tests were run. Runtime changes do.

## 9. Validation and proposed budgets

Extend existing tests; keep assertions about visitor-visible behavior, not only dataset names or source strings.

Required coverage:
- Both root and /storybook/ routes.
- Existing 1440x900, 390x844, 320x720 and 844x390 dimensions; add 671, 760 and 761px layout boundaries and a tablet width.
- Forward/reverse/paused/fast scrolling; all four seam crossings; hash navigation; Back; resize/rotation; tab visibility and page restoration.
- Character movement during the sticky interval, not merely that the progress variable changed.
- Zero accidental duplicate active Paperkeepers at handoffs.
- Foot-anchor stability and visible hand/page contact; exactly one canonical rescue page representation at a time.
- No overlap with essential text/control safe zones; no horizontal page overflow.
- Real touch-direction tests for the folio gallery and Atrium; retain keyboard focus/Back restoration.
- Atlas, notes, light toggle and local Field Letter remain usable.
- Reduced motion, keyboard-only, no-JS, failed sprite loading and delayed image decode.
- Capture selected motion clips or frame sequences as well as screenshots. V3 screenshots currently use animations:disabled and therefore cannot alone establish natural timing.

Proposed incremental budgets, to verify rather than claim:
- Added narrative JavaScript <=15 KiB gzip over the audited baseline.
- Added mobile character/prop exports <=150 KiB; load later-chapter additions near use rather than at initial paint.
- No new WebGL engine, full-page video or general physics dependency.
- Prefer transform/opacity for moving layers; profile filters and oversized composited textures.
- No recurring narrative animation work after finite actions settle or while the document is hidden.
- On the same CI machine, aim for p95 narrative scripting <=4ms per active frame and investigate any new narrative-attributable long task >50ms.
- Compare layout shift, loading and scrolling traces against the baseline; do not represent laboratory results as physical-phone FPS or real-user Core Web Vitals.

Engineering acceptance: tests, build, collision checks, lifecycle behavior and resource budget.
Visual acceptance: silhouette, legible acting, grounded contact, pacing and continuous page identity inspected from real renders.
Physical-phone testing and human artistic approval must retain their honest status until actually performed.

## 10. Immediate next execution step

Start with Stage 1: synchronize scene progress and breakpoint ownership, with a regression reproducing the observed 0.3828 -> 0.7559 frozen walker. Then implement the continuous actor against those same production files.

The objective is a guide that notices, acts and leaves consequences across the page while the visitor retains control of the journey.


## 25 November 2026 — user-reported movement and identity correction

The owner reports that Paperkeeper jumps and that the drawings look inconsistent. The old runtime swaps visibly different legacy walk/read cells with the high-detail R02 silhouette, and direct relocations can become visible during an opacity transition. This correction uses the R02 stand cell consistently during ordinary travel, a small grounded lean rather than a mismatched walking cycle, separate facing and positional transforms, capped scroll-distance increments, a short compositor transition and hidden relocation for large skips. Genuine river rescue poses remain a separate authored art set. A new matching hand-drawn gait/action library and final physical-device visual acceptance are still outstanding; do not claim that a stable silhouette is a new anatomical walking cycle. The V3 browser test samples small forward and reverse increments and computed canonical frame selection.
