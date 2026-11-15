#!/usr/bin/env python3
"""Stage 09 river-source integrity, approved content and no-capture regression."""
from pathlib import Path
from PIL import Image
import hashlib, json, re
ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'storybook/assets/river-stories'
manifest=json.loads((DIR/'manifest.json').read_text())
assert manifest['schema']=='lazarus-river-stories-v1'
assert manifest['stage']==9
expected={'source/river-source.webp','exports/river-desktop.webp','exports/river-mobile.webp'}
assert {item['path'] for item in manifest['items']}==expected
for item in manifest['items']:
    p=DIR/item['path']
    payload=p.read_bytes()
    assert len(payload)==item['bytes'],(p,len(payload))
    assert hashlib.sha256(payload).hexdigest()==item['sha256'],p
    assert len(payload)<900_000,p
    with Image.open(p) as im:
        im.load()
        assert im.format=='WEBP',p
        assert (im.width,im.height)==(item['width'],item['height']),p
        assert im.mode=='RGB',p
assert (DIR/'README.md').exists()
for path in (ROOT/'index.html',ROOT/'storybook/index.html'):
    page=path.read_text()
    section=page.split('id="river-stories"',1)[1].split('id="house-on-the-hill"',1)[0]
    assert page.count('data-chapter aria-labelledby=')==5,path
    assert page.count('<h1 ')==1,path
    assert 'styles/river-stories.css' in page and 'src/storybook/river-stories.js' in page,path
    assert 'river-desktop.webp' in section and 'river-mobile.webp' in section,path
    assert 'roundbird.idle.webp' in section,path
    assert 'What happens<br><em>between the lines.</em>' in section,path
    assert 'Behind the finished image are sketches, wrong turns, experiments, and better questions.' in section,path
    assert 'NOT PUBLISHED ARTICLES' in section,path
    assert 'These are editorial outlines. No article is available to read yet.' in section,path
    assert section.count('data-river-jump=')==2,path
    assert section.count('<details class="river-note-fold">')==2,path
    assert section.count('QUESTIONS FOR A FUTURE ESSAY')==2,path
    for letter in 'ab':
        assert f'id="river-note-{letter}"' in section,path
        assert f'href="#river-note-{letter}"' in section,path
    assert "Thoughts on the studio's earlier three-dimensional website experiment." in section,path
    assert 'How surface, light, and atmosphere change the feeling of a digital space.' in section,path
for file in [ROOT/'scripts/forest_river_smoke.mjs',ROOT/'src/storybook/river-stories.js']:
    body=file.read_text().lower()
    assert not re.search(r'\.screenshot\s*\(',body),file
    assert not re.search(r'\.to[jp]pe?g\s*\(',body),file
print('PASS STAGE09: 3 river original/source exports verified SHA/size/dimensions; 2 live HTML note links; 5 chapters; zero screenshot APIs')
