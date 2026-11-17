#!/usr/bin/env python3
"""Stage 11 non-visual integrity contract. No screenshots, no network."""
from pathlib import Path
import re
import json
import hashlib

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'storybook/assets/characters/manifest.json').read_text())
required = {
    'paperkeeper.walk-a.webp', 'paperkeeper.walk-b.webp', 'paperkeeper.walk-c.webp',
    'paperkeeper.read.webp', 'paperkeeper.three-quarter.webp',
}
declared = {asset['name']: asset for asset in manifest['assets']}
assert required <= declared.keys(), 'missing canonical Paperkeeper pose exports'
for name in sorted(required):
    asset = declared[name]
    path = ROOT / 'storybook/assets/characters' / name
    assert path.is_file(), name
    b = path.read_bytes()
    assert len(b) == asset['bytes'], name + ': byte mismatch'
    assert hashlib.sha256(b).hexdigest() == asset['sha256'], name + ': SHA256 mismatch'
    assert asset['width'] > 0 and asset['height'] > 0
    print(f'PASS pose {name} / {len(b)} bytes')
for name in ['index.html', 'storybook/index.html']:
    html = (ROOT / name).read_text()
    assert html.count('data-paperkeeper-motion') == 1, name
    assert html.count('data-paperkeeper-step') == 0, name + ': deprecated motion choice'
    assert html.count('data-paperkeeper-walk') == 1, name
    assert html.count('data-paperkeeper-pose') == 2, name + ': missing Vite-resolved hidden pose sources'
    assert html.count('river-paperkeeper-reader') == 1, name
    assert 'paperkeeper-motion.js' in html and 'paperkeeper-motion.css' in html
    assert sum(' data-chapter ' in tag for tag in re.findall('<section[^>]*>', html)) == 5 and html.count('<h1') == 1, name
    print('PASS semantic route', name)
js = (ROOT / 'src/storybook/paperkeeper-motion.js').read_text()
assert 'setInterval' in js and '100)' in js, '10fps timing absent'
assert 'IntersectionObserver' in js and 'autoPlayed' in js
assert 'visibilitychange' in js
assert 'scrollTo(' not in js and 'preventDefault(' not in js
css = (ROOT / 'src/storybook/styles/paperkeeper-motion.css').read_text()
assert '@media (prefers-reduced-motion: reduce)' in css
assert 'infinite' not in css.lower(), 'repeating loops are disallowed'
for path in ['scripts/forest_paperkeeper_motion_smoke.mjs', '.github/workflows/forest-paperkeeper-motion.yml']:
    s = (ROOT/path).read_text()
    assert not re.search(r'page\.screenshot\s*\(', s), 'screenshot capture prohibited'
print('PASS Stage 11 authored sprites, automatic movement and screenshot exclusions')
