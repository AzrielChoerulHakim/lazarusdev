#!/usr/bin/env python3
"""Stage 06 reproducible exports from two separately composed source illustrations.

These original AI-assisted digital crayon works are NOT crops of the locked
master V2 board. Desktop and mobile have independently authored scenes.
The leaf cue is an original separate cutout; Paperkeeper is Stage 05 asset.
"""
from PIL import Image
from pathlib import Path
import argparse

def build(root):
    root=Path(root); exports=root/'exports';exports.mkdir(parents=True,exist_ok=True)
    desktop=Image.open(root/'source/entrance-gate-art-source.webp').convert('RGB')
    mobile=Image.open(root/'source/entrance-portrait-art-source.webp').convert('RGB')
    assert desktop.size==(1536,1024) and mobile.size==(1024,1536)
    desktop.save(exports/'entrance-desktop.webp',format='WEBP',quality=76,method=6)
    mobile.resize((768,1320),Image.Resampling.LANCZOS).save(exports/'entrance-mobile.webp',format='WEBP',quality=78,method=6)
    # Leaf cue is a separate canonical foreground RGBA source rather than regenerated.
    assert (exports/'entrance-leaf-cue.webp').exists()
    print('Built Stage 06 desktop + distinct portrait compositions')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--dir',default='storybook/assets/entrance');a=p.parse_args();build(a.dir)