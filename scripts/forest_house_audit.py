#!/usr/bin/env python3
"""Chapter 05 asset-integrity and narrative/HTML checks. No screen captures."""
from pathlib import Path
import hashlib,json
from PIL import Image

root=Path('storybook/assets/house-on-the-hill')
manifest=json.loads((root/'manifest.json').read_text())
expected={
 'source/house-crayon-source.webp':((1536,1024),'RGB'),
 'exports/house-desktop.webp':((1536,1024),'RGB'),
 'exports/house-mobile.webp':((768,1152),'RGB'),
 'exports/window-glow-desktop.webp':((1536,1024),'RGBA'),
 'exports/window-glow-mobile.webp':((768,1152),'RGBA'),
}
assert len(manifest['items'])==5
assert len(set(item['path'] for item in manifest['items']))==5
for item in manifest['items']:
 path=item['path'];assert path in expected,path
 file=root/path;raw=file.read_bytes(); im=Image.open(file);im.load()
 assert hashlib.sha256(raw).hexdigest()==item['sha256'],path+' checksum'
 assert len(raw)==item['size'],path+' byte size'
 assert im.size==expected[path][0]==(item['width'],item['height']),path+' dimensions'
 assert im.mode==expected[path][1]==item['mode'],path+' color mode'
 assert len(raw)<550000,path+' budget'
 print('PASS ART',path,im.size,im.mode,len(raw))
for html,prefix in [('index.html','./storybook/'),('storybook/index.html','./')]:
 source=Path(html).read_text()
 assert source.count('class="chapter chapter-house"')==1
 assert 'id="house-on-the-hill"' in source and 'id="house-on-the-hill-title"' in source
 for phrase in ['Small by choice.','Wide in imagination.',"We're not here to make more of the same.", 'A LETTER LEFT AT THE DOOR','Nothing is sent, submitted, stored or shared','CONTACT DELIVERY / NOT YET CONNECTED']:
  assert phrase in source,(html,phrase)
 for p in ['house-desktop.webp','house-mobile.webp','window-glow-desktop.webp','window-glow-mobile.webp']:
  assert prefix+'assets/house-on-the-hill/exports/'+p in source,(html,p)
 assert source.count('id="studio-inquiry"')==1
 assert source.count('id="house-brief"')==1
 assert source.count('data-house-light-toggle')==1
 assert source.count('data-house-copy')==1
 assert 'aria-pressed="false"' in source
 assert 'type="button"' in source
 assert 'href="#studio-inquiry"' in source
 assert source.count('h1')>=1 and source.count('section class="chapter chapter-')==5
 assert 'house-on-the-hill.css' in source and 'house-on-the-hill.js' in source
 assert 'Send your message' not in source and 'Message sent' not in source
 print('PASS HTML',html,'scene, manifesto, addressable brief, honest contact disclosure')
js=Path('src/storybook/house-on-the-hill.js').read_text()
assert 'navigator.clipboard.writeText' in js and 'document.execCommand' in js
assert 'fetch(' not in js and 'localStorage' not in js and 'XMLHttpRequest' not in js
css=Path('src/storybook/styles/house-on-the-hill.css').read_text()
assert 'prefers-reduced-motion: reduce' in css and '[data-lit="true"]' in css
print('PASS STAGE10 source/assets semantics; no screenshots')
