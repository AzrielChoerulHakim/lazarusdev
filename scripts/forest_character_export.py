#!/usr/bin/env python3
"""LAZARUS DEV / Character Bible V1 export pipeline.

Source canvases: purpose-generated character studies, never crops of master V2.
The canonical WebP source sheets and exported RGBA sprites live in the repo.
Dependencies: Pillow, numpy, opencv-python-headless.

Usage:
  python scripts/forest_character_export.py --source storybook/assets/characters/source \
    --output /tmp/lazarus-character-regeneration

Export is a deterministic masking study of the specific approved character
source sheets, not a generic procedural mascot generator and not Stage 11 motion.
"""
from pathlib import Path
import argparse, hashlib, json
from PIL import Image
import numpy as np
import cv2

SPECS = [
 ('paperkeeper.front.webp',0,(0,90,438,808),'turnaround','front'),
 ('paperkeeper.three-quarter.webp',0,(442,90,897,808),'turnaround','three-quarter'),
 ('paperkeeper.profile.webp',0,(899,90,1321,808),'turnaround','profile'),
 ('paperkeeper.back.webp',0,(1320,90,1774,808),'turnaround','back'),
 ('paperkeeper.walk-a.webp',1,(595,337,684,439),'action','walk-a'),
 ('paperkeeper.walk-b.webp',1,(695,337,784,439),'action','walk-b'),
 ('paperkeeper.walk-c.webp',1,(787,337,874,439),'action','walk-c'),
 ('paperkeeper.read.webp',1,(1018,337,1106,431),'action','read'),
 ('paperkeeper.rest.webp',1,(1342,339,1490,424),'action','rest'),
 ('roundbird.idle.webp',1,(23,483,160,577),'support','roundbird'),
 ('moth.guide.webp',1,(168,473,316,572),'support','moth'),
]
SOURCES=['paperkeeper-turnaround-source.webp','paperkeeper-actions-source.webp']

def export_one(im,name,box,role,dest):
    rgb=np.asarray(im.crop(box).convert('RGB'))
    h,w=rgb.shape[:2]
    r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    # Color-select surrounding fibrous paper; fill enclosed cream faces and
    # satchels as foreground rather than chroma-keying them away.
    paper=(r>228)&(g>206)&(b>177)&((r-g)<43)&((g-b)<48)
    candidate=(~paper).astype('uint8')*255
    kernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7) if role=='turnaround' else (3,3))
    candidate=cv2.morphologyEx(candidate,cv2.MORPH_CLOSE,kernel,iterations=2)
    count,labels,stats,_=cv2.connectedComponentsWithStats(candidate,8)
    if count<2:raise RuntimeError('No artwork detected: '+name)
    main=(labels==1+np.argmax(stats[1:,cv2.CC_STAT_AREA])).astype('uint8')*255
    mask=cv2.morphologyEx(main,cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(13,13) if role=='turnaround' else (5,5)))
    contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    solid=np.zeros(mask.shape,dtype='uint8')
    cv2.drawContours(solid,contours,-1,255,-1)
    alpha=cv2.GaussianBlur(solid,(3,3),.6)
    image=Image.fromarray(np.dstack((rgb,alpha)),'RGBA')
    bounds=image.getbbox()
    if bounds is None:raise RuntimeError('Empty mask: '+name)
    pad=12 if role=='turnaround' else 7
    image=image.crop((max(0,bounds[0]-pad),max(0,bounds[1]-pad),
                      min(w,bounds[2]+pad),min(h,bounds[3]+pad)))
    image.save(dest/name,'WEBP',quality=83,alpha_quality=100,method=6,exact=True)
    return image

def make_atlas(images,dest):
    for mode,file in [('silhouette','paperkeeper-silhouette.webp'),('color','paperkeeper-small-scale.webp')]:
        atlas=Image.new('RGBA',(480,218),(0,0,0,0))
        for index,image in enumerate(images):
            if mode=='silhouette':
                icon=Image.new('RGBA',image.size,(27,42,31,255))
                icon.putalpha(image.getchannel('A'))
            else:icon=image.copy()
            icon.thumbnail((109 if mode=='silhouette' else 110,194 if mode=='silhouette' else 196),Image.Resampling.LANCZOS)
            atlas.alpha_composite(icon,(index*120+(120-icon.width)//2,6+(194-icon.height)//2))
        atlas.save(dest/file,'WEBP',lossless=(mode=='silhouette'),quality=78,alpha_quality=95,method=6,exact=True)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',default='storybook/assets/characters/source')
    ap.add_argument('--output',default='storybook/assets/characters')
    args=ap.parse_args();src=Path(args.source);out=Path(args.output)
    out.mkdir(parents=True,exist_ok=True)
    canvases=[Image.open(src/file).convert('RGB') for file in SOURCES]
    large=[]
    for name,idx,box,role,pose in SPECS:
        im=export_one(canvases[idx],name,box,role,out)
        if role=='turnaround':large.append(im)
        print(f'EXPORTED {name} {im.width}x{im.height} {hashlib.sha256((out/name).read_bytes()).hexdigest()[:12]}')
    make_atlas(large,out)
    print('Exported 13 assets. Compare manifests; no Stage 11 animation was produced.')

if __name__=='__main__':main()