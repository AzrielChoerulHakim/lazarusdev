#!/usr/bin/env python3
"""Stage 04: reproducible original forest artwork *pipeline test*.

Produces transparent WebP parallax sheets and one independent cutout. This
programmatic pencil study is not the manually art-directed finished Chapter 01
or approved replacement for the original Master V2 illustrated forest.
No external photos, model assets, extracted masterboard pixels or characters.
Usage: python scripts/forest_asset_generator.py --output storybook/assets/exports
Requires Pillow >=10.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import argparse, math, random, hashlib, json

FOREST=(36,79,59)
INK=(39,56,41)
MOSS=(94,117,60)
OLIVE=(134,145,73)
OCHRE=(214,156,61)
CLAY=(216,106,74)
BARK=(118,81,47)
BARK_DARK=(87,65,47)
BARK_LIGHT=(190,135,73)
PAPER=(247,233,214)

class Pencil:
    def __init__(self,w,h,seed):
        self.w,self.h=w,h
        self.image=Image.new('RGBA',(w,h),(0,0,0,0))
        self.draw=ImageDraw.Draw(self.image,'RGBA')
        self.rng=random.Random(seed)
    def j(self,n):
        return self.rng.uniform(-n,n)
    def stroke(self,pts,color,width=2,repeat=1,jitter=.6):
        for i in range(repeat):
            ps=[(round(x+self.j(jitter)),round(y+self.j(jitter))) for x,y in pts]
            self.draw.line(ps,fill=(*color,235 if i==0 else 170),width=max(1,width-i//2),joint='curve')
    def leaf(self,x,y,rx,ry,theta,color):
        vx,vy=math.cos(theta),math.sin(theta)
        sx,sy=-vy,vx
        tip=(x+vx*rx,y+vy*rx)
        tail=(x-vx*rx*.86,y-vy*rx*.86)
        left=(x+sx*ry,y+sy*ry)
        right=(x-sx*ry,y-sy*ry)
        polygon=[]
        for a,b in [(tip,left),(left,tail),(tail,right),(right,tip)]:
            for t in (0,.23,.48,.74):
                polygon.append((a[0]*(1-t)+b[0]*t+self.j(.7),a[1]*(1-t)+b[1]*t+self.j(.7)))
        self.draw.polygon(polygon,fill=(*color,self.rng.randint(210,249)))
        self.stroke([tail,(x,y),tip],FOREST,1,1,.8)
        for i in range(3):
            tt=(i-1)/5
            aa=(x+vx*tt*rx+sx*ry*.44,y+vy*tt*rx+sy*ry*.44)
            bb=(x+vx*(tt+.15)*rx-sx*ry*.14,y+vy*(tt+.15)*rx-sy*ry*.14)
            self.stroke([aa,bb],BARK_LIGHT,1,1,1)
    def branch(self,coords,thick):
        self.draw.line(coords,fill=(*BARK_DARK,255),width=thick,joint='curve')
        self.draw.line(coords,fill=(*BARK,255),width=max(3,thick-7),joint='curve')
        self.stroke(coords,BARK_LIGHT,max(2,thick//10),2,2.5)
        for _ in range(thick*2):
            a=self.rng.randrange(len(coords)-1)
            p,q=coords[a],coords[a+1]
            t=self.rng.random()
            x=p[0]*(1-t)+q[0]*t+self.j(thick*.27)
            y=p[1]*(1-t)+q[1]*t+self.j(thick*.27)
            dx=q[0]-p[0];dy=q[1]-p[1];L=max(math.hypot(dx,dy),1)
            length=self.rng.uniform(5,19)
            self.stroke([(x,y),(x+dx/L*length,y+dy/L*length)],self.rng.choice([BARK_DARK,BARK_LIGHT,CLAY]),1,1,1.5)
    def flower(self,x,y,scale=1):
        for a in range(5):
            t=a*math.tau/5
            ox=math.cos(t)*5*scale;oy=math.sin(t)*5*scale
            self.draw.ellipse((x+ox-3.8*scale,y+oy-3.8*scale,x+ox+3.8*scale,y+oy+3.8*scale),fill=(*PAPER,249))
        self.draw.ellipse((x-2*scale,y-2*scale,x+2*scale,y+2*scale),fill=(*OCHRE,255))

def canopy(w=1440,h=780,seed=407,portrait=False):
    p=Pencil(w,h,seed)
    s=w/(760 if portrait else 1440)
    def scaled(values):return [(x*s,y*s) for x,y in values]
    if portrait:
        branches=[
            ([(-60,1070),(33,743),(73,428),(141,133),(262,-45)],57),
            ([(64,440),(175,306),(297,239),(466,184)],19),
            ([(812,1065),(749,798),(712,532),(691,234),(619,-45)],42)]
        bunches=[(70,63,161,135),(252,60,250,90),(515,15,215,112),(700,181,120,175),(14,360,126,199),(730,617,109,218)]
    else:
        branches=[
            ([(-88,823),(-7,560),(62,292),(168,93),(305,-73)],82),
            ([(65,311),(165,196),(308,102),(477,43),(630,-23)],33),
            ([(17,553),(94,438),(174,403),(262,363)],22),
            ([(1498,828),(1409,607),(1371,397),(1292,183),(1168,-24)],50),
            ([(1372,385),(1297,317),(1204,274),(1094,204)],21)]
        bunches=[(160,104,240,110),(363,42,250,125),(494,9,210,100),(6,303,158,186),
                 (92,470,175,187),(1353,95,174,157),(1303,249,160,130),
                 (1435,408,155,165),(1106,67,158,112)]
    for points,thick in branches:p.branch(scaled(points),round(thick*s))
    colors=[FOREST,(47,101,65),(62,102,57),MOSS,OLIVE,(164,159,73),OCHRE,(194,130,57)]
    for cx,cy,rx,ry in bunches:
        for _ in range(round(220*rx/220)):
            a=p.rng.random()*math.tau
            r=math.sqrt(p.rng.random())
            x=(cx+math.cos(a)*r*rx)*s
            y=(cy+math.sin(a)*r*ry)*s
            if portrait:
                if 190*s<x<575*s and 205*s<y<870*s:continue
            else:
                if 500*s<x<1020*s and 150*s<y<615*s:continue
            p.leaf(x,y,p.rng.uniform(7,17)*s,p.rng.uniform(4,9)*s,a+.4,p.rng.choice(colors))
    for _ in range(225):
        if portrait:
            x=p.rng.choice([p.rng.uniform(0,172),p.rng.uniform(614,760)])
            y=p.rng.uniform(900,1100)
        else:
            x=p.rng.choice([p.rng.uniform(0,375),p.rng.uniform(1140,1440)])
            y=p.rng.uniform(650,835)
        height=p.rng.uniform(10,65)
        p.stroke(scaled([(x,y),(x+p.j(16),y-height)]),p.rng.choice([FOREST,MOSS,OLIVE,OCHRE]),p.rng.choice([1,2,2]),1,1)
    for _ in range(17):
        if portrait:
            x=p.rng.choice([p.rng.uniform(40,140),p.rng.uniform(642,730)])
            y=p.rng.uniform(900,980)
        else:
            x=p.rng.choice([p.rng.uniform(70,360),p.rng.uniform(1150,1420)])
            y=p.rng.uniform(640,770)
        p.flower(x*s,y*s,p.rng.uniform(.7,1.1)*s)
    return p.image

def cutout(w=520,h=720,seed=816):
    p=Pencil(w,h,seed)
    p.draw.polygon([(232,192),(265,192),(283,625),(226,641)],fill=(*BARK,255))
    for edge in [[(232,192),(226,641)],[(265,192),(283,625)]]:
        p.stroke(edge,BARK_DARK,4,2,1.4)
    for _ in range(118):
        x=p.rng.uniform(235,269);y=p.rng.uniform(215,621)
        p.stroke([(x,y),(x+p.j(4),y+p.rng.uniform(7,24))],p.rng.choice([BARK_DARK,BARK_LIGHT]),1,1,1)
    for polygon,base in [
        ([(93,173),(287,143),(411,188),(296,239),(103,253),(85,224)],OCHRE),
        ([(141,286),(352,292),(431,341),(350,375),(148,362),(130,326)],(195,143,82))]:
        p.draw.polygon(polygon,fill=(*base,250))
        p.stroke(polygon+[polygon[0]],BARK_DARK,3,2,1.5)
    for _ in range(250):
        top=p.rng.choice((True,False))
        x=p.rng.uniform(112,347) if top else p.rng.uniform(150,357)
        y=p.rng.uniform(183,220) if top else p.rng.uniform(306,345)
        p.stroke([(x,y),(x+p.rng.uniform(5,28),y+p.j(3))],p.rng.choice([BARK_DARK,BARK_LIGHT,(237,198,126)]),1,1,1)
    for x,y in [(264,199),(283,335)]:
        p.draw.ellipse((x-5,y-5,x+5,y+5),fill=(*BARK_DARK,255))
        p.draw.point((x-2,y-2),fill=(*PAPER,255))
    for cx,cy,rx,ry in [(220,246,52,25),(253,381,43,19),(238,547,28,54),(205,625,40,23)]:
        for _ in range(65):
            a=p.rng.random()*math.tau;r=math.sqrt(p.rng.random())
            x=cx+math.cos(a)*r*rx;y=cy+math.sin(a)*r*ry
            p.leaf(x,y,p.rng.uniform(3,9),p.rng.uniform(2,4),a+.4,p.rng.choice([MOSS,FOREST,OLIVE]))
    return p.image

def write_assets(output):
    output.mkdir(parents=True,exist_ok=True)
    entries=[]
    images=[
       ('forest-canopy.desktop.webp',canopy(1440,780,407,False),'parallax-foreground',False),
       ('forest-canopy.mobile.webp',canopy(760,1040,407,True),'parallax-foreground',False),
       ('crooked-wayfinder.cutout.webp',cutout(),'interactive-cutout',True)]
    for name,image,role,interactive in images:
        path=output/name
        image.save(path,'WEBP',quality=83,method=6,exact=True)
        alpha=image.getchannel('A')
        entries.append({'filename':name,'path':'storybook/assets/exports/'+name,
          'role':role,'interactive':interactive,'resolution':[image.width,image.height],
          'format':'image/webp','alpha':True,'alpha_extrema':list(alpha.getextrema()),
          'bounds':list(alpha.getbbox()),'bytes':path.stat().st_size,
          'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
          'masterboard_crop':False,
          'source':'scripts/forest_asset_generator.py',
          'provenance':'original deterministic illustration study with per-material directional marks; no external assets',
          'license':'Original Lazarus Dev test study; not a third-party asset'})
    manifest={'schema':'lazarus-forest-art-source-v1','stage':'04',
      'master':'The Forest Between Pages V2','artistic_status':'TECHNICAL STUDY ONLY — final crayon artwork not approved',
      'character_sheet':'not started (Stage 05)','assets':entries}
    (output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',default='storybook/assets/exports')
    opts=parser.parse_args()
    print(json.dumps(write_assets(Path(opts.output)),indent=2))
