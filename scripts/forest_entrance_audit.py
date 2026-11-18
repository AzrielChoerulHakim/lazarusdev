#!/usr/bin/env python3
"""Stage 06 reproducible asset integrity only, not an automatic art score."""
from PIL import Image
from pathlib import Path
import hashlib, json, sys
root=Path('storybook/assets/entrance')
manifest=json.loads((root/'manifest.json').read_text())
assert manifest['schema']=='lazarus-forest-entrance-v1'
assert manifest['stage']=='06'
assert len(manifest['exports'])==3
assert len(manifest['sources'])==2
assert manifest['masterboard_crop'] is False
for record in manifest['sources']+manifest['exports']:
    path=root/record['path']
    assert path.exists(),path
    raw=path.read_bytes()
    assert len(raw)==record['bytes'],path
    assert hashlib.sha256(raw).hexdigest()==record['sha256'],path
    assert len(raw)<record['max_bytes'],f'Budget exceeded {path}'
    with Image.open(path) as image:
        assert list(image.size)==record['dimensions'],path
        assert image.format=='WEBP',path
        assert image.mode==record['mode'],(path,image.mode)
        if record['name']=='entrance-leaf-cue.webp':
            assert image.getchannel('A').getextrema()[0]==0 and image.getchannel('A').getextrema()[1]>=240,path
            assert image.getpixel((0,0))[3]==0,path
    print('STAGE06 ASSET PASS',record['name'],len(raw),'bytes')
exports={a['name']:a for a in manifest['exports']}
assert exports['entrance-mobile.webp']['dimensions'][1]>exports['entrance-mobile.webp']['dimensions'][0]
assert exports['entrance-desktop.webp']['dimensions'][0]>exports['entrance-desktop.webp']['dimensions'][1]
character=Path('storybook/assets/characters/paperkeeper.three-quarter.webp')
assert character.exists(),'Stage 05 guide missing'
with Image.open(character) as img:
    assert img.mode=='RGBA' and img.width>=400 and img.height>=600
for path in (Path('index.html'),Path('storybook/index.html')):
    html=path.read_text(encoding='utf-8')
    assert 'entrance-desktop.webp' in html
    assert 'entrance-mobile.webp' in html
    # R15A replaces the displayed image with a source-preserving cleaned alpha
    # export. The original Stage05 character is still hashed and retained.
    assert ('paperkeeper.three-quarter.webp' in html or 'r15a/entrance-r15a.webp' in html), path
    if 'r15a/entrance-r15a.webp' in html:
        replacement=Path('storybook/assets/characters/r15a/entrance-r15a.webp')
        assert replacement.is_file(),replacement
        with Image.open(replacement) as image:
            assert image.mode=='RGBA' and image.size==(622,960)
    assert 'entrance-leaf-cue.webp' in html
    assert 'id="entrance-title"' in html
    assert 'href="#work-clearing"' in html
    assert 'href="#winding-path"' in html
    assert 'entrance.css' in html
    assert 'art-reserve-entrance' not in html
    assert html.count('<h1 ') == 1
    assert 'name="viewport"' in html
    expected_robots = "index,follow,max-image-preview:large" if path == Path("index.html") else "noindex,follow"
    assert f'name="robots" content="{expected_robots}"' in html, (path, "robots metadata")
    assert 'rel="canonical" href="https://azrielchoerulhakim.github.io/lazarusdev/"' in html
print('STAGE06 ASSET + SEMANTIC STATIC PASS (human art approval remains separate)')