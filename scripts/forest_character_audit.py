#!/usr/bin/env python3
"""Audit source + 13 files for Stage 05 without claiming machine aesthetic judgement."""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image
ap=argparse.ArgumentParser()
ap.add_argument('--root',default='storybook/assets/characters')
opt=ap.parse_args()
base=Path(opt.root)
manifest=json.loads((base/'manifest.json').read_text(encoding='utf8'))
assert manifest['schema']=='lazarus-character-bible-v1'
assert manifest['asset_count']==13
assert len(manifest['assets'])==13
assert len({v['name'] for v in manifest['assets']})==13
assert len([v for v in manifest['assets'] if v['role']=='turnaround'])==4
assert {v['pose'] for v in manifest['assets'] if v['role']=='turnaround'}=={'front','three-quarter','profile','back'}
assert len([v for v in manifest['assets'] if v['role']=='action'])==5
assert {v['pose'] for v in manifest['assets'] if v['role']=='support'}=={'moth','roundbird'}
assert all(not v.get('masterboard_crop',False) for v in manifest['source_details'])
assert all('AI-assisted' in manifest['rights'] for _ in [0])
for source in manifest['source_details']:
 p=base/'source'/source['file']
 assert p.is_file(),p
 assert p.stat().st_size<450_000,p
 assert p.read_bytes()[:4]==b'RIFF'
 with Image.open(p) as im:
  assert im.width>=1600 and im.height>=850, (p,im.size)
for a in manifest['assets']:
 p=base/a['name'];raw=p.read_bytes()
 assert raw[:4]==b'RIFF' and raw[8:12]==b'WEBP',p
 assert hashlib.sha256(raw).hexdigest()==a['sha256'],f'hash mismatch {p}'
 assert len(raw)==a['bytes'],p
 with Image.open(p) as im:
  assert im.mode=='RGBA',(p,im.mode)
  assert (im.width,im.height)==(a['width'],a['height']),(p,im.size)
  alpha=im.getchannel('A')
  assert alpha.getextrema()==(0,255),(p,alpha.getextrema())
  corners=[(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]
  assert all(alpha.getpixel(pt)==0 for pt in corners),(p,'no transparent outer corners')
  assert im.width>=44 and im.height>=65,(p,im.size)
  if a['role']=='turnaround':
   assert im.width>=380 and im.height>=640,(p,im.size)
   assert p.stat().st_size<100_000,p
  if a['role']=='action':
   assert p.stat().st_size<30_000,p
  # Mid-canvas alpha coverage safeguards against empty/incorrect segmentation.
  hist=alpha.histogram()
  opaque=sum(hist[180:])/(im.width*im.height)
  assert opaque>.10, (p,'too little visible art',opaque)
  print('PASS',a['name'],im.size,len(raw),'bytes')
# Silhouette atlas must visibly contain four different alpha shapes.
with Image.open(base/'paperkeeper-silhouette.webp') as im:
 alpha=im.getchannel('A')
 ratios=[]
 for col in range(4):
  crop=alpha.crop((col*120,0,(col+1)*120,218))
  n=sum(crop.histogram()[128:]); ratios.append(n/(120*218))
 assert all(.02<x<.67 for x in ratios),ratios
print('STAGE 05 TECHNICAL ASSET AUDIT PASS; manual character consistency and anti-generic gate remains separate.')