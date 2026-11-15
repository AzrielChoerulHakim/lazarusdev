#!/usr/bin/env python3
"""Stage 08 original concept illustrations: reproducible rough-pencil paper sheets.
Production background comes from new ImageGen source. Sheet artwork is an
original procedural colored-pencil drawing specific to each named *concept*.
No pixels are cropped from the V2 masterboard; no actual client/project images.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from pathlib import Path
import random, math, hashlib, json, argparse, shutil

W,H=580,770
PAPER=(247,233,214)
INK=(39,56,41)
BARK=(104,76,54)
GREEN=(36,79,59)
RIVER=(90,140,175)
SUN=(243,195,84)
CLAY=(216,106,74)


def lines_texture(dr, bbox, color, n, seed, slope=0.5, width=(1,3), opacity=70, clip=None):
    rng=random.Random(seed)
    x1,y1,x2,y2=bbox
    lay=Image.new('RGBA',(W,H))
    d=ImageDraw.Draw(lay,'RGBA')
    for _ in range(n):
        x=rng.uniform(x1,x2); y=rng.uniform(y1,y2)
        lng=rng.uniform(4,18)
        dx=lng/math.sqrt(1+slope*slope)
        dy=dx*slope
        col=tuple(color)+(rng.randint(max(10,opacity-28),min(255,opacity+25)),)
        d.line([(x,y),(x+dx,y+dy)], fill=col,width=rng.randint(*width))
    if clip: lay.putalpha(Image.composite(lay.getchannel('A'),Image.new('L',(W,H)),clip))
    return lay

def hatch_poly(base, pts, color, seed, n=300,slope=-.58,width=(1,3)):
    mask=Image.new('L',(W,H)); md=ImageDraw.Draw(mask);md.polygon(pts,fill=255)
    bb=mask.getbbox();
    if not bb:return
    base.alpha_composite(lines_texture(None,bb,color,n,seed,slope,width,opacity=98,clip=mask))

def rough_line(draw, p1,p2,fill,seed=0,wd=3):
    r=random.Random(seed)
    for c in range(2):
        points=[]
        for i in range(18):
            t=i/17; x=p1[0]*(1-t)+p2[0]*t;y=p1[1]*(1-t)+p2[1]*t
            points.append((round(x+r.uniform(-1.7,1.7)),round(y+r.uniform(-1.7,1.7))))
        draw.line(points,fill=fill,width=wd if c==0 else 1,joint='curve')

def art_sky(im, rect, hue, seed):
    dr=ImageDraw.Draw(im,'RGBA'); x1,y1,x2,y2=rect
    dr.rounded_rectangle(rect,radius=10,fill=tuple(hue)+(255,))
    im.alpha_composite(lines_texture(None,rect,(248,230,194),1750,seed,.38,(1,2),opacity=73))
    im.alpha_composite(lines_texture(None,rect,(40,73,73),700,seed+3,-.65,(1,2),opacity=38))
    for _ in range(90):
        r=random.Random(seed+_*17)
        x=r.randrange(x1+8,x2-8);y=r.randrange(y1+9,y2-8)
        dr.ellipse((x,y,x+r.randint(1,3),y+2),fill=(246,230,195,r.randint(20,80)))

def path_art(im, seed=2):
    """The Atrium: threshold, limestone slabs and impossible inward arch."""
    dr=ImageDraw.Draw(im,'RGBA')
    box=(51,67,529,547)
    art_sky(im,box,(114,149,160),seed)
    dr.polygon([(51,435),(130,352),(223,390),(345,330),(529,395),(529,547),(51,547)],fill=(109,127,109,255))
    hatch_poly(im,[(51,435),(130,352),(223,390),(345,330),(529,395),(529,547),(51,547)],(34,79,59),seed+4,1200)
    # Back arch: offset grey stone portico with large warm void
    pts=[(161,450),(159,234),(177,176),(231,135),(308,125),(367,170),(399,243),(398,447),(348,448),(349,251),(337,216),(299,185),(250,182),(219,206),(204,254),(204,449)]
    dr.polygon(pts,fill=(195,176,135,255),outline=(75,86,77,255),width=5)
    hatch_poly(im,pts,(66,66,60),seed+5,2000,-.44,(1,2))
    # Inner portal, turquoise-violet glow with arched top
    dr.polygon([(205,449),(205,247),(220,211),(252,184),(299,188),(334,216),(350,247),(350,450)],fill=(76,118,124,255))
    dr.ellipse((224,189,332,302),fill=(231,201,112,225))
    dr.ellipse((243,207,315,318),fill=(251,229,158,255))
    dr.polygon([(220,450),(243,328),(284,272),(311,330),(343,450)],fill=(226,174,109,220))
    # Stone brick seams + niches
    for i in range(6):
        yy=247+i*34
        rough_line(dr,(164,yy),(202,yy+3),(88,90,77,170),seed+12+i,2)
        rough_line(dr,(351,yy),(394,yy-3),(88,90,77,170),seed+22+i,2)
    for i in range(4):
        xx=203+i*40
        rough_line(dr,(xx,147+int(abs(xx-270)*.3)),(xx+19,151+int(abs(xx-270)*.3)),(72,75,64,150),seed+99+i,1)
    # Thin impossible inner arch line and enigmatic orbit
    dr.arc((118,88,446,483),-64,202,fill=(252,219,143,180),width=4)
    dr.arc((114,88,449,486),-64,205,fill=(62,98,90,175),width=2)
    for j in range(7):
        y=449+j*15; width=74+j*29
        dr.polygon([(280-width,y),(280+width,y),(298+width,y+12),(267-width,y+13)],fill=(196-j*4,154-j*4,101-j*2,255),outline=(89,85,62,210),width=2)
        hatch_poly(im,[(280-width,y),(280+width,y),(298+width,y+12),(267-width,y+13)],(74,70,67),seed+300+j,120,-.52,(1,1))
    # moss tufts and uncanny small stones
    for i in range(74):
        rr=random.Random(seed*100+i); x=rr.randint(66,511);y=rr.randint(448,535)
        if 213<x<347 and y<479:continue
        dr.line([(x,y),(x+rr.randint(-8,4),y-rr.randint(5,20))],fill=(40,86,57,rr.randint(120,225)),width=rr.randint(1,3))
        if i%12==0:dr.ellipse((x-3,y-12,x+3,y-5),fill=(247,204,111,230))

def oracle_art(im,seed=4):
    """The Oracle: hand-marked armillary and connected questions, not dashboard."""
    dr=ImageDraw.Draw(im,'RGBA');box=(51,67,529,547)
    art_sky(im,box,(64,94,104),seed)
    # faded winding horizon and ancient table
    dr.polygon([(51,445),(124,416),(219,430),(328,394),(529,424),(529,547),(51,547)],fill=(57,85,70,255))
    hatch_poly(im,[(51,445),(124,416),(219,430),(328,394),(529,424),(529,547),(51,547)],(132,151,84),seed+17,1000,.34)
    dr.ellipse((116,430,454,510),fill=(118,82,64,255),outline=(49,69,55,255),width=5)
    # concentric copper orrery, asymmetric ink hatching
    center=(298,276)
    for i,(rx,ry) in enumerate([(155,196),(125,157),(87,115)]):
        dr.ellipse((center[0]-rx,center[1]-ry,center[0]+rx,center[1]+ry),outline=(218,153,91,220),width=5 if i==0 else 3)
        dr.arc((center[0]-rx-4,center[1]-ry-3,center[0]+rx+4,center[1]+ry+4),20,198,fill=(248,224,152,185),width=2)
    dr.line((132,328,453,220),fill=(238,189,109,245),width=5)
    dr.line((184,151,399,398),fill=(175,151,102,220),width=3)
    dr.line((295,86,295,468),fill=(83,121,115,200),width=3)
    # stylized sun, tiny knots and scholarly stars
    dr.ellipse((263,240,333,309),fill=(246,209,121,255),outline=(250,238,191,255),width=4)
    for i in range(110):
        rr=random.Random(seed*500+i)
        x=rr.randint(63,520);y=rr.randint(85,448)
        r=rr.choice([1,1,2,2,3]);alpha=rr.randint(115,240)
        dr.ellipse((x-r,y-r,x+r,y+r),fill=(246,216,158,alpha))
        if r>=3:
            dr.line((x-9,y,x+9,y),fill=(249,222,164,160),width=1)
            dr.line((x,y-9,x,y+9),fill=(249,222,164,160),width=1)
    constellation=[(112,164),(181,128),(226,188),(364,138),(441,197),(411,312),(473,376),(159,352)]
    for a,b in [(0,1),(1,2),(2,3),(3,4),(4,5),(5,6),(5,7)]:
        rough_line(dr,constellation[a],constellation[b],(235,215,159,185),seed+9+a+b,2)
    for x,y in constellation:
        dr.ellipse((x-5,y-5,x+5,y+5),fill=(245,204,124,255),outline=(247,234,188,255),width=2)
    # lectern and notation marks
    dr.line((295,430,295,507),fill=(120,93,60,255),width=8)
    dr.polygon([(213,495),(374,495),(396,513),(196,513)],fill=(191,124,77,255),outline=(63,67,53,255),width=3)
    for i in range(14):
        rr=random.Random(500+i);x=rr.randint(74,516);y=rr.randint(72,533)
        if 200<x<400 and 220<y<336:continue
        dr.arc((x-9,y-9,x+9,y+9),rr.randint(0,90),rr.randint(180,300),fill=(242,195,106,90),width=2)

def archive_art(im,seed=8):
    """The Archive: monumental shelves, a circular stair, floating manuscript."""
    dr=ImageDraw.Draw(im,'RGBA');box=(51,67,529,547)
    art_sky(im,box,(118,134,119),seed)
    # central towering book arch
    dr.polygon([(112,543),(111,176),(138,124),(201,101),(375,101),(437,137),(463,194),(463,544)],fill=(125,92,68,255),outline=(57,64,51,255),width=6)
    hatch_poly(im,[(112,543),(111,176),(138,124),(201,101),(375,101),(437,137),(463,194),(463,544)],(59,73,56),seed+17,2200,.59)
    dr.polygon([(162,543),(162,217),(182,179),(224,148),(340,148),(387,178),(410,223),(410,543)],fill=(56,77,69,255),outline=(210,168,103,255),width=5)
    # several shelf alcoves; books varied widths/height
    for tier,yy in enumerate([236,318,398,477]):
        dr.line((173,yy,396,yy),fill=(197,148,94,255),width=10)
        rr=random.Random(seed*13+tier)
        xx=176
        while xx<389:
            ww=rr.randint(8,19);hh=rr.randint(36,65)
            yy2=yy-hh
            hue=rr.choice([(194,117,78),(125,138,117),(191,157,92),(108,116,122),(157,116,91),(76,105,89)])
            dr.polygon([(xx,yy-4),(xx+ww,yy-4),(xx+ww+rr.randint(-1,2),yy2),(xx+rr.randint(-1,1),yy2)],fill=hue+(255,),outline=(52,65,55,220),width=2)
            if rr.random()<.7:dr.line((xx+2,yy2+8,xx+ww-2,yy2+9),fill=(235,201,140,200),width=2)
            if rr.random()<.28:dr.line((xx+3,yy2+16,xx+ww-2,yy2+16),fill=(217,181,125,170),width=1)
            xx+=ww+rr.randint(1,5)
    # winding ivory manuscript ribbon and ladder
    for i in range(6):
        dr.arc((182+i*10,243+i*27,429-i*2,469+i*9),96,267,fill=(240,213,160,200),width=2)
    dr.line((370,219,307,528),fill=(224,166,94,255),width=7)
    dr.line((392,223,330,533),fill=(224,166,94,255),width=7)
    for k in range(10):
        y=241+k*27;x=375-k*6
        rough_line(dr,(x-2,y),(x+20,y+3),(66,76,61,220),seed+300+k,3)
    # floating paper folio foreground in a curving wind
    dr.polygon([(138,433),(184,418),(223,443),(205,484),(155,484)],fill=(250,228,173,250),outline=(77,94,69,240),width=3)
    dr.line((181,424,181,473),fill=(147,122,84,230),width=2)
    for j in range(5):
        dr.arc((101+j*16,402+j*11,175+j*26,450+j*15),-30,80,fill=(237,195,121,200),width=2)
    # moss and quiet dust motes
    for i in range(95):
        rr=random.Random(seed*87+i)
        x=rr.randrange(67,514);y=rr.randrange(105,536)
        if rr.random()<.22:dr.ellipse((x,y,x+2,y+2),fill=(252,223,153,rr.randint(70,185)))


def make_sheet(name,fn,dest,stroke_source=None):
    rng=random.Random({'atrium':91,'oracle':107,'archive':173}[name])
    paper_mask=Image.new('L',(W,H));maskdraw=ImageDraw.Draw(paper_mask)
    # independent handmade edge, not a CSS rectangle
    left=[(rng.randint(16,24),y) for y in range(28,H-32,10)]
    right=[(rng.randint(W-29,W-20),y) for y in range(28,H-32,10)]
    top=[(x,rng.randint(23,30)) for x in range(20,W-20,13)]
    bot=[(x,rng.randint(H-52,H-32)) for x in range(W-25,20,-12)]
    outline=top+right+bot+list(reversed(left))
    maskdraw.polygon(outline,fill=255)
    # opacity shadow only underneath paper
    canvas=Image.new('RGBA',(W,H),(0,0,0,0));sh=Image.new('RGBA',(W,H),(37,51,37,0));sh.putalpha(paper_mask.filter(ImageFilter.GaussianBlur(10)));shadow=Image.new('RGBA',(W,H),(0,0,0,0));shadow.paste((36,51,41,80),(8,13,W+8,H+13),sh.getchannel('A'))
    canvas.alpha_composite(shadow)
    paper=Image.new('RGBA',(W,H),(*PAPER,255));d=ImageDraw.Draw(paper,'RGBA')
    for i in range(6200):
        x=rng.randint(21,W-22);y=rng.randint(27,H-39)
        light=rng.choice([0,1,2]);col=(151,113,72,rng.randint(3,24)) if light==0 else (255,249,225,rng.randint(15,43))
        d.ellipse((x,y,x+rng.randint(1,4),y+rng.randint(1,3)),fill=col)
    fn(paper)
    # Reuse *only the high-frequency colored-pencil grain* of the newly
    # generated, purpose-created clearing artwork, never the approved master
    # board or a cropped mockup composition. Keeps brush texture cohesive.
    if stroke_source is not None:
        art_box=(53,69,527,544)
        ref=stroke_source.crop((311,130,1170,882)).resize((art_box[2]-art_box[0],art_box[3]-art_box[1]),Image.Resampling.LANCZOS).convert('L')
        blurred=ref.filter(ImageFilter.GaussianBlur(5))
        a=paper.load();gr=ref.load();gb=blurred.load()
        for yy in range(art_box[1],art_box[3]):
            for xx in range(art_box[0],art_box[2]):
                delta=int(gr[xx-art_box[0],yy-art_box[1]])-int(gb[xx-art_box[0],yy-art_box[1]])
                ratio=max(.82,min(1.18,1+delta*.006))
                old=a[xx,yy]
                a[xx,yy]=(max(0,min(255,int(old[0]*ratio))),max(0,min(255,int(old[1]*ratio))),max(0,min(255,int(old[2]*ratio))),old[3])
    d=ImageDraw.Draw(paper,'RGBA')
    # bleeding pigment at the edges of each framed plate
    d.rounded_rectangle((49,65,531,550),radius=12,outline=(101,93,68,190),width=3)
    for i in range(43):
        rr=random.Random(i*37+len(name))
        x=rr.randint(28,W-28);y=rr.choice([rr.randrange(32,58),rr.randrange(564,593),rr.randrange(666,700)])
        d.line((x,y,x+rr.choice([-4,1,7]),y+rr.randint(-3,3)),fill=(130,111,83,rr.randint(20,88)),width=rr.randint(1,3))
    # two ornamental ruled lines in the blank html title field
    rough_line(d,(56,591),(521,591),(138,121,87,150),seed=44,wd=1)
    rough_line(d,(56,713),(521,713),(138,121,87,120),seed=65,wd=1)
    # organic stamped dots on paper
    for i in range(11):
        x=rng.randrange(58,523);y=rng.choice([rng.randrange(558,578),rng.randrange(718,727)]);d.ellipse((x-2,y-2,x+2,y+2),fill=(103,106,75,80))
    # ropes and little clasp at top
    d.line((W//2,4,W//2,42),fill=(110,80,51,255),width=6)
    d.line((W//2+5,4,W//2+5,42),fill=(228,185,116,220),width=2)
    d.rounded_rectangle((W//2-26,30,W//2+28,62),radius=5,fill=(140,94,55,255),outline=(62,71,56,255),width=3)
    d.line((W//2-13,39,W//2+18,39),fill=(240,203,132,180),width=3)
    # mask entire drawable page but allow hanger at top and shadow
    cutoff=paper_mask.copy();md=ImageDraw.Draw(cutoff);md.rectangle((W//2-29,0,W//2+30,63),fill=255)
    paper.putalpha(cutoff)
    canvas.alpha_composite(paper)
    canvas.save(dest,format='WEBP',quality=84,method=6,exact=True)
    return Image.open(dest)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--source',required=True);ap.add_argument('--output',required=True)
    a=ap.parse_args();p=Path(a.output);p.mkdir(parents=True,exist_ok=True)
    background=Image.open(a.source).convert('RGB')
    # archive original as high quality source, compose web-ready independently
    orig=p/'source';orig.mkdir(exist_ok=True)
    if Path(a.source).suffix.lower() == '.webp':
        target=orig/'work-clearing-source.webp'
        if Path(a.source).resolve()!=target.resolve(): shutil.copy2(a.source,target)
    else:
        background.save(orig/'work-clearing-source.webp',format='WEBP',quality=83,method=6)
    bg=ImageOps.fit(background,(1536,1024),Image.Resampling.LANCZOS,centering=(.5,.48))
    bg.save(p/'work-clearing-woods.webp',format='WEBP',quality=78,method=6)
    results=[]
    for name,fun in [('atrium',path_art),('oracle',oracle_art),('archive',archive_art)]:
        file=p/f'folio-{name}.webp';im=make_sheet(name,fun,file,background)
        results.append({'file':file.name,'width':im.width,'height':im.height,'mode':im.mode})
    all_files=['source/work-clearing-source.webp','work-clearing-woods.webp','folio-atrium.webp','folio-oracle.webp','folio-archive.webp']
    manifest={'schema':'lazarus-work-clearing-v1','stage':8,'master':'The Forest Between Pages V2','source_provenance':'New image-generation-assisted clearing background, 2026-11-16; original independent procedural colored-pencil folio drawings built with Pillow; no pixels copied from locked V2 board, no client claims.', 'items':[]}
    for f in all_files:
        path=p/f;im=Image.open(path)
        manifest['items'].append({'path':f,'width':im.width,'height':im.height,'mode':im.mode,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    (p/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'results':results,'manifest':manifest},indent=2))

if __name__=='__main__':main()