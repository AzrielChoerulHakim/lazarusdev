# Asset provenance

## Marble Bust 01 — scanned/modelled 3D sculpt

- **Creator:** Rico Cilliers
- **Source:** Poly Haven — https://polyhaven.com/a/marble_bust_01
- **License:** CC0 1.0 — https://polyhaven.com/license
- **Mirrored binary:** Innerscene 3D Parts Library, originally from Poly Haven
- **File:** `models/marble_bust_01.glb`
- **SHA-256:** `f09278501571c32e50edabcf9a2508427fe967c9511393ef18a6c9f360f340dd`
- **Acquisition:** `python scripts/fetch_cc0_bust.py`

The bust is a third-party CC0 artist-created model, **not** a Lazarus Dev
original sculpt or an asset generated from our brand reference illustration.
Lazarus Dev's scene composition, break-apart effect, portal, camera and
animation are original implementation work.

The model preserves the artist's attribution as a courtesy even though CC0
does not require it. Other scene elements are custom procedural geometry and
shaders. Do not mistake this model for the exact statue depicted in the
reference painting.


## Old Sandstone 02 — weathered architectural PBR maps

- **Creator:** Dimitrios Savva
- **Source:** Poly Haven — https://polyhaven.com/a/old_sandstone_02
- **License:** CC0 1.0 — https://polyhaven.com/license
- **Files:** `textures/old_sandstone_02_{diff,nor_gl,rough}_1k.jpg`
- **Acquisition:** `python scripts/fetch_stone_pbr.py`
- **SHA-256 diffuse:** `a58111224570bb33eba3c348bc7e3207255b5efb07f9cf274209c56b71d6825c`
- **SHA-256 normal:** `4dcaa85f9de33d77cec4e89e6f63cd1afecb81e436104c1b7eb4b151fe0b7f75`
- **SHA-256 roughness:** `5473aa8e1c244f8e191f4e6616b75062af98fc04594c2c28f66c44aa078c0ebe`

The portal geometry, sky, seawater and ribbons are Lazarus Dev's original
procedural 3D and shaders, while the stone *surface maps* are the licensed
Poly Haven photography. The sculpt and stone texture remain CC0 when reused.


## Earth's Moon — NASA CGI Moon Kit (LROC/LOLA)

- **Source:** NASA Scientific Visualization Studio — https://svs.gsfc.nasa.gov/4720/
- **Credits:** NASA SVS / Ernie Wright; LROC camera team and LOLA instrument team
- **Use:** 2025 lunar color map `lroc_color_2k.jpg`; topography `ldem_3_8bit.jpg`
- **License:** Public domain (U.S. government imagery)
- **Acquisition:** `python scripts/fetch_nasa_moon.py`
- **Local files:** `assets/moon/lroc_color_2k.jpg` and `assets/moon/ldem_3_8bit.jpg`

The moon is rendered as real 3D geometry with the color mosaic and height map; lighting, geometry depth and scale are artistic approximations, not a scientific reconstruction.
