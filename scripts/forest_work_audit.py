#!/usr/bin/env python3
"""Stage 08 asset integrity, semantics and honesty gate (does not take screenshots)."""
from pathlib import Path
from PIL import Image
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'storybook/assets/work-clearing'
manifest=json.loads((ASSETS/'manifest.json').read_text())
assert manifest['schema']=='lazarus-work-clearing-v1'
assert manifest['stage']==8
files=manifest['items']
assert len(files)==5
expected={'source/work-clearing-source.webp','exports/work-clearing-woods.webp', 'exports/folio-atrium.webp','exports/folio-oracle.webp','exports/folio-archive.webp'}
assert {f['path'] for f in files}==expected
for f in files:
    p=ASSETS/f['path'];assert p.is_file(),f'Missing {p}'
    payload=p.read_bytes();assert len(payload)==f['bytes'],p
    assert hashlib.sha256(payload).hexdigest()==f['sha256'],p
    assert len(payload)<900_000, p
    with Image.open(p) as im:
        im.load()
        assert (im.width,im.height)==(f['width'],f['height']),p
        if 'folio-' in p.name:
            assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255),p
            assert im.width>=500 and im.height>=700,p
        else: assert im.width==1536 and im.height==1024,p
for page in (ROOT/'index.html',ROOT/'storybook/index.html'):
    text=page.read_text()
    section=text.split('id="work-clearing"',1)[1].split('id="river-stories"',1)[0]
    assert text.count('section data-chapter')==0  # real semantic section tags used
    assert text.count('data-chapter aria-labelledby=')==5,page
    assert text.count('<h1 ')==1,page
    assert 'styles/work-clearing.css' in text and 'storybook/work-clearing.js' in text,page
    assert section.count('data-open-concept=')==3, page
    for slug in ('atrium','oracle','archive'):
        assert f'data-open-concept="{slug}" href="#folio-{slug}"' in section,page
        assert f'data-concept="the-{slug}" id="folio-{slug}"' in section,page
        assert f'folio-{slug}.webp' in section,page
    assert 'not client commissions' in section and 'not a client commission' in section, page
    assert 'href="#folio-atrium"' in section and 'href="#folio-oracle"' in section and 'href="#folio-archive"' in section
    assert 'illustration-deferred' not in section
    assert 'work-clearing-woods.webp' in section
    assert text.count('src="')>0
assert '.screenshot(' not in (ROOT/'scripts/forest_work_smoke.mjs').read_text().lower()
print('PASS STAGE08: 5 original source/exports, 3 unique project folios, both semantic routes, provenance/alpha/SHA-256, no screenshot capture')