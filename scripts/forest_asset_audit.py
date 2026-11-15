#!/usr/bin/env python3
"""Stage 04 asset integrity and responsive export checks. Not an aesthetic score."""
from pathlib import Path
from PIL import Image
import hashlib, json, argparse

parser=argparse.ArgumentParser()
parser.add_argument('--directory',default='storybook/assets/exports')
opts=parser.parse_args()
folder=Path(opts.directory)
manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
assert manifest['schema']=='lazarus-forest-art-source-v1'
assert manifest['stage']=='04'
assert len(manifest['assets'])==3
names={asset['filename'] for asset in manifest['assets']}
assert names=={
 'forest-canopy.desktop.webp',
 'forest-canopy.mobile.webp',
 'crooked-wayfinder.cutout.webp',
}
for asset in manifest['assets']:
    path=folder/asset['filename']
    assert path.is_file(),path
    assert asset['source']=='scripts/forest_asset_generator.py'
    assert asset['masterboard_crop'] is False
    assert asset['bytes']==path.stat().st_size
    assert asset['sha256']==hashlib.sha256(path.read_bytes()).hexdigest()
    assert path.stat().st_size < 290_000, f'Over budget: {path}'
    with Image.open(path) as im:
        assert im.mode=='RGBA',(path,im.mode)
        assert list(im.size)==asset['resolution']
        extrema=im.getchannel('A').getextrema()
        assert extrema==(0,255),(path,extrema)
        assert list(extrema)==asset['alpha_extrema']
        assert len(im.getcolors(im.width*im.height) or [])>400, 'Insufficient material variation'
        print('PASS',asset['filename'],im.size,im.mode,path.stat().st_size,'bytes')

cut=Image.open(folder/'crooked-wayfinder.cutout.webp').convert('RGBA')
b=cut.getchannel('A').getbbox()
assert b is not None
assert b[0]>30 and b[1]>30 and cut.width-b[2]>30 and cut.height-b[3]>30
assert cut.getpixel((0,0))[3]==0
assert cut.getpixel((cut.width-1,cut.height-1))[3]==0

desk=Image.open(folder/'forest-canopy.desktop.webp')
mobile=Image.open(folder/'forest-canopy.mobile.webp')
assert desk.width>desk.height
assert mobile.height>mobile.width
# Mobile is recomposed with separate drawing routine; not a resized desktop.
assert desk.size!=(mobile.width,mobile.height)
print('STAGE 04 ASSET INTEGRITY PASS. Artistic signoff still requires human judgment.')
