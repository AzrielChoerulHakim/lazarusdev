#!/usr/bin/env python3
"""Reproducible Stage 07 exports from purpose-generated original crayon painting.

The mobile image is a camera-path reconstruction/remapping of the Stage07 *new*
source painting, NOT an independently illustrated portrait; source claims must
state this. No use of the flattened V2 masterboard or generic vector illustrations.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / 'storybook/assets/winding-path'

def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

def export(base: Path) -> None:
    src = base / 'source/winding-path-crayon-source.webp'
    assert src.exists(), f'missing source: {src}'
    out = base / 'exports'
    out.mkdir(parents=True, exist_ok=True)
    original = Image.open(src).convert('RGB')
    assert original.size == (1536, 1024), original.size
    # Landscape is an individually compressed export of a purpose-rendered scene.
    desktop = out / 'winding-path-desktop.webp'
    original.save(desktop, 'WEBP', quality=79, method=6)

    # Portrait storyboard: shift the framing center with the winding trail from
    # its lower-left foreground to its upper-right background. Each scanline is
    # remapped continuously; there is no hard collage seam or simple CSS crop.
    # This remains a derivation from the original work, NOT fresh portrait art.
    w, h = 768, 1248
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = yy / float(h - 1)
    center = 365.0 + 755.0 * (1 - t ** 1.08)
    map_x = center + (xx / (w - 1) - 0.5) * 635.0
    map_y = (t ** 0.988) * 1023
    array = np.asarray(original)
    portrait = cv2.remap(array, map_x, map_y, interpolation=cv2.INTER_CUBIC,
                         borderMode=cv2.BORDER_REFLECT_101)
    mobile = out / 'winding-path-mobile.webp'
    Image.fromarray(portrait).save(mobile, 'WEBP', quality=80, method=6)

    files=[]
    for p, kind in [(src,'source'),(desktop,'desktop'),(mobile,'mobile')]:
        with Image.open(p) as im:
            width,height=im.size; mode=im.mode
        files.append(dict(path=p.relative_to(base).as_posix(),role=kind,width=width,height=height,
                          bytes=p.stat().st_size,sha256=sha(p),mode=mode))
    manifest=dict(schema='lazarus-forest-path-v1',chapter='02 — Winding Path',version='1.0.0',
                  artwork='Original AI-assisted digital crayon/colored-pencil landscape generated specifically for Lazarus Dev, 2026-11-15.',
                  source='New 1536x1024 artwork. NOT sourced from V2 flattened masterboard.',
                  mobile_provenance='Purpose-composed portrait traversal via continuous serpentine pixel remapping of this new original painting. Not a separately generated painting, not a basic crop or collage. Re-evaluate mobile-native art at Stage14.',
                  character='Reuses unchanged Stage05 Paperkeeper and moth independent transparent assets.',
                  animation='One user-invoked SVG pencil-route reveal only. No automatic motion, scroll lock or parallax engine.',
                  files=files)
    (base/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    print('STAGE07 image export',[(x['role'],x['width'],x['height'],x['bytes']) for x in files])

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--base',type=Path,default=DEFAULT)
    export(a.parse_args().base)