# R15A — Frame and grounding specification

**Production source:** immutable R02 high-resolution alpha + Stage05 character bible + R11 original 9-frame sprite; all normalized assets live in `storybook/assets/characters/r15a/`.

**Nine-frame sheet:** `paperkeeper-journey-r15a.webp`, 1152×144px; **9 cells** of 128×144px, one per `step-a`, `step-b`, `step-c`, `stand`, `turn`, `look`, `reach`, `read`, `lantern`. Frame positions 0%, 12.5%, 25%, 37.5%, 50%, 62.5%, 75%, 87.5%, 100% on a `background-size:900% 100%` element. Each frame reserves at least 8px left/top/right padding; foot baseline **133px** and 11px transparent bottom padding, corrected by CSS `translateY(7.63889%)`. Individual `pose-*.webp` files preserve this frame and anchor for external reuse.

**Narrative status:** The nine available legacy frame names are retained for backward compatibility. The true `reach` drawn hand action and `lift`/`carry` are **not** present in these source sheets. They must not be misrepresented: dedicated character art study exists, but the production asset export currently contains source-derived pictures only. R16 can use this locked technical frame contract to integrate newly authored poses without another crop/alpha overhaul.

**Four alpha backgrounds** are genuine compositing proofs using exact production sheet bytes: [paper](../../../../storybook/assets/characters/r15a/proof-paper.png), [forest](../../../../storybook/assets/characters/r15a/proof-dark.png), [river](../../../../storybook/assets/characters/r15a/proof-river.png), [black](../../../../storybook/assets/characters/r15a/proof-black.png). All frame bounds, source sha and bytes are recorded in [anchor manifest](./ANCHOR-MANIFEST.json) and [input audit](./ASSET-AUDIT.json).

**Placement rule:** Foot coordinates are taken from `keeper-journey.js` and R14's frozen composition contract, not shifted to make frame bottoms match. Place character at intended groundline, never overlay native links; on river even desktop controls sit outside illustrated frame. At mobile <=670px, min walker painted height is increased and a local dark shadow improves contrast without colorizing pigment.
