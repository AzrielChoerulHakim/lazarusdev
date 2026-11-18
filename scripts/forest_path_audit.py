#!/usr/bin/env python3
"""Stage 07 deterministic source/asset and HTML contract audit (no screenshots)."""
import hashlib, json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'storybook/assets/winding-path'
man=json.loads((BASE/'manifest.json').read_text())
assert man['schema']=='lazarus-forest-path-v1'
assert len(man['files'])==3
expected={'source':(1536,1024),'desktop':(1536,1024),'mobile':(768,1248)}
for entry in man['files']:
    p=BASE/entry['path']
    assert p.exists(),p
    raw=p.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==entry['sha256'],p
    assert len(raw)==entry['bytes'],p
    with Image.open(p) as im:
        assert im.size==expected[entry['role']], (p,im.size)
        assert im.format=='WEBP' and im.mode=='RGB',p
    assert len(raw)<(1_000_000 if entry['role']=='source' else 700_000),p
assert (BASE/'exports/winding-path-mobile.webp').read_bytes()!=(BASE/'exports/winding-path-desktop.webp').read_bytes()
for html in [ROOT/'index.html',ROOT/'storybook/index.html']:
    t=html.read_text()
    assert t.count('id="winding-path"')==1
    assert t.count('id="winding-path-title"')==1
    assert t.count('<h1')==1
    assert t.count('section class="chapter')==5
    assert 'path-map' in t and 'data-path-map' in t
    assert 'winding-path-mobile.webp' in t and 'winding-path-desktop.webp' in t
    assert 'paperkeeper.three-quarter.webp' in t and 'moth.guide.webp' in t
    assert 'data-walk="path"' in t
    assert 'href="#work-clearing"' in t
    assert 'Discover' in t and 'Define' in t and 'Make' in t and 'Refine' in t
    assert 'src/storybook/keeper-journey.js' in t or '../src/storybook/keeper-journey.js' in t
    assert 'src/storybook/styles/winding-path.css' in t
for p in ['storybook/assets/characters/paperkeeper.three-quarter.webp', 'storybook/assets/characters/moth.guide.webp']:
    assert (ROOT/p).exists(),p
for file in ['src/storybook/keeper-journey.js','src/storybook/styles/winding-path.css']:
    assert (ROOT/file).exists()
print('STAGE07 ASSET & SEMANTIC AUDIT PASS', [(a['role'],a['bytes']) for a in man['files']])