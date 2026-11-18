/** R15A: non-destructive canonical Paperkeeper export.
 * Requires sharp already pinned in package.json. Run with:
 * node scripts/forest_r15a_export.mjs
 *
 * Inputs are immutable: R02 full-resolution alpha and Stage05/11 sprites.
 * Every exported pixel is traceable to one of those real source sprites.
 * The five narrative reference poses are editorial candidates, and must not
 * be silently substituted for the production reach/lift/carry drawings.
 */
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'storybook/assets/characters/r15a');
const doc=resolve(root,'docs/forest/revision/r15a');
const sourcePaths={
 journey:'storybook/assets/characters/paperkeeper-journey.webp',
 hero:'storybook/assets/entrance/r02/exports/paperkeeper.three-quarter.webp',
 front:'storybook/assets/characters/paperkeeper.front.webp',
 threeQuarter:'storybook/assets/characters/paperkeeper.three-quarter.webp',
 profile:'storybook/assets/characters/paperkeeper.profile.webp',
 back:'storybook/assets/characters/paperkeeper.back.webp',
 reader:'storybook/assets/characters/paperkeeper.read.webp',
 walkA:'storybook/assets/characters/paperkeeper.walk-a.webp',
 walkB:'storybook/assets/characters/paperkeeper.walk-b.webp',
 walkC:'storybook/assets/characters/paperkeeper.walk-c.webp'
};
const poses=[
 ['step-a','walkA','walking study — original step A'],
 ['step-b','walkB','walking study — original step B'],
 ['step-c','walkC','walking study — original step C'],
 ['stand','hero','high-resolution R02 three-quarter, lantern in hand'],
 ['turn','profile','turnaround profile; not a unique drawn turn animation'],
 ['look','front','original illustrated front view'],
 ['reach','journey','legacy river gesture, needs purpose-drawn refinement'],
 ['read','reader','original seated reader; not interchangeable with lift'],
 ['lantern','hero','original illustrated lantern carrier']
];
const W=128,H=144,FOOT=133,PAD=8;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const abs=relative=>resolve(root,relative);
async function readRgba(bytes){
 const data=await sharp(bytes,{limitInputPixels:100_000_000}).ensureAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
 return {data:Buffer.from(data.data),width:data.info.width,height:data.info.height,channels:data.info.channels};
}
async function toRgba(raw){
 return sharp(raw.data,{raw:{width:raw.width,height:raw.height,channels:4}})
   .png({compressionLevel:9}).toBuffer();
}
function bounds(rgba,threshold=45){
 let left=rgba.width,top=rgba.height,right=0,bottom=0,opaque=0,partial=0,edgeWhite=0,red=0;
 const b=rgba.data,w=rgba.width,h=rgba.height;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=(y*w+x)*4, a=b[p+3], r=b[p],g=b[p+1],bl=b[p+2];
  if(a>threshold){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
  if(a>=240)opaque++;
  else if(a>0)partial++;
  if(a>10&&a<210&&r>235&&g>218&&bl>205)edgeWhite++;
  if(a>10&&r>164&&g<97&&bl<110&&r>g*1.55)red++;
 }
 return {rect:left<right?[left,top,right,bottom]:null,opaque,partial,edgeWhite,red,
  dimensions:[w,h]};
}
function fix(rgba,{paper=false}={}){
 const src=rgba.data,out=Buffer.from(src),w=rgba.width,h=rgba.height;
 // Preserve internal cream face, leaf highlights, and white satchel strokes.
 // Remove only connected outdoor paper from the perimeter, not all pale pixels.
 if(paper){
  let origin=[0,0,0],count=0;
  for(let x=0;x<w;x+=Math.max(1,Math.floor(w/10)))for(const y of [0,h-1]){
   let i=(y*w+x)*4;origin[0]+=src[i];origin[1]+=src[i+1];origin[2]+=src[i+2];count++;
  }
  origin=origin.map(v=>v/count);
  const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);let qh=0,qt=0;
  const admit=k=>{
   if(k<0||k>=w*h||visited[k])return;
   const i=k*4,r=src[i],g=src[i+1],b=src[i+2];
   const d=Math.abs(r-origin[0])*.3+Math.abs(g-origin[1])*.4+Math.abs(b-origin[2])*.3;
   if(d>37 || r<176 || g<157 || b<131)return;
   visited[k]=1;queue[qt++]=k;
  };
  for(let x=0;x<w;x++){admit(x);admit((h-1)*w+x);}
  for(let y=0;y<h;y++){admit(y*w);admit(y*w+w-1);}
  while(qh<qt){
   const k=queue[qh++],x=k%w,y=(k/w)|0;
   if(x>0)admit(k-1);if(x<w-1)admit(k+1);if(y>0)admit(k-w);if(y<h-1)admit(k+w);
  }
  for(let k=0;k<w*h;k++)if(visited[k]){
   const i=k*4;
   out[i+3]=0;
  }
 }
 // Delete obvious red keying artifacts; the actual forest palette does not
 // use vivid RGB red. This is limited to pixels near the original edge.
 let erased=0,corrected=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=(y*w+x)*4, a=out[p+3],r=src[p],g=src[p+1],b=src[p+2];
   if(!a)continue;
   if(r>168&&g<81&&b<94&&r>g*2.25&&r>b*2.0){out[p+3]=0;erased++;continue;}
   if(a<24){out[p+3]=0;erased++;continue;}
   // A pale edge can arise from premultiplication against white paper.
   // Consult the nearest fully opaque pigment; keep pale internal highlights.
   if(a<216&&r>221&&g>211&&b>197){
    let best=-1,dist=20;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
     let xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;
     const q=(yy*w+xx)*4;
     const d=dx*dx+dy*dy;
     if(src[q+3]>=247&&d<dist){best=q;dist=d;}
    }
    if(best>=0 && (src[best]+src[best+1]+src[best+2])/3<205){
      out[p]=Math.round(r*.18+src[best]*.82);
      out[p+1]=Math.round(g*.18+src[best+1]*.82);
      out[p+2]=Math.round(b*.18+src[best+2]*.82);
      corrected++;
    }
   }
 }
 return {data:out,width:w,height:h,deleted:erased,corrected};
}
function cropData(raw,bbox,margin=2){
 if(!bbox)throw Error('Empty art mask');
 const [l,t,r,b]=bbox;
 const x=Math.max(0,l-margin),y=Math.max(0,t-margin);
 const x2=Math.min(raw.width,r+margin),y2=Math.min(raw.height,b+margin);
 let out=Buffer.alloc((x2-x)*(y2-y)*4);
 for(let yy=y;yy<y2;yy++)raw.data.copy(out,(yy-y)*(x2-x)*4,(yy*raw.width+x)*4,(yy*raw.width+x2)*4);
 return {data:out,width:x2-x,height:y2-y};
}
async function encode(raw,options={}){
 return sharp(raw.data,{raw:{width:raw.width,height:raw.height,channels:4}})
   .webp({quality:options.quality??86,alphaQuality:100,effort:6,lossless:false}).toBuffer();
}
async function sourceRgb(relative,rectangle=null){
 const bytes=await readFile(abs(sourcePaths[relative]));
 const data=rectangle?await sharp(bytes).extract(rectangle).ensureAlpha().raw().toBuffer({resolveWithObject:true}):await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 return {image:{data:Buffer.from(data.data),width:data.info.width,height:data.info.height},
  bytes:sha(bytes),size:bytes.length};
}
async function renderOnFrame(raw,frameW,frameH,targetH,targetFoot=frameH-11){
 const r=raw.width/raw.height,targetW=Math.min(frameW-2*PAD,Math.round(targetH*r));
 const h=Math.max(1,Math.round(targetW/r));
 const pixels=await sharp(raw.data,{raw:{width:raw.width,height:raw.height,channels:4}})
 .resize(targetW,h,{fit:'fill',kernel:'lanczos3'}).raw().toBuffer();
 const out=Buffer.alloc(frameW*frameH*4);
 const left=Math.floor((frameW-targetW)/2),top=Math.max(PAD,targetFoot-h);
 if(top+h>frameH)throw Error('Frame oversized at baseline');
 for(let y=0;y<h;y++)pixels.copy(out,((top+y)*frameW+left)*4,y*targetW*4,(y+1)*targetW*4);
 return {data:out,width:frameW,height:frameH,foot:[Math.floor(frameW/2),targetFoot],
  fitted:[targetW,h],origin:[left,top]};
}
const src={};
for(const name of Object.keys(sourcePaths)){
 const data=await sourceRgb(name);
 src[name]={...data};
}
await mkdir(output,{recursive:true});
await mkdir(doc,{recursive:true});
const audit={schema:'lazarus-r15a-input-audit-v1',raw:{},notes:[
 'All canonical Stage05 and R02 source exports remain immutable.',
 'White edge diagnostics are numerical candidates; intended cream highlights are protected.',
 'Narrative river action is not falsely claimed to be a brand-new hand-drawn reach/lift/carry pose.'
]};
const read={};
for(const name of Object.keys(sourcePaths)){
 const file=await sourceRgb(name),orig=fix(file.image,{paper:name==='reader'||/^walk/.test(name)});
 read[name]=orig;
 audit.raw[name]={path:sourcePaths[name],sha256:file.bytes,bytes:file.size,
  before:bounds(file.image),after:bounds(orig),deletedSaturatedRed:orig.deleted,
  decontaminatedEdgePixels:orig.corrected};
}
const sourceStrip=read.journey;
if(sourceStrip.width % 9 !== 0 || sourceStrip.height<80)
 throw Error('Journey must contain nine equal cells, received '+sourceStrip.width+'×'+sourceStrip.height);
const sourceCellWidth=sourceStrip.width/9;
const stripFrames=[];
for(let i=0;i<9;i++){
 const raw=cropData(sourceStrip,[i*sourceCellWidth,0,(i+1)*sourceCellWidth,sourceStrip.height],0);
 // Use original painterly frame 7 for the seated posture; frame 6 is an
 // existing limited key pose, not an artist-verified hand-reach.
 stripFrames.push(raw);
}
let sheet=Buffer.alloc(W*9*H*4);
const manifest={schema:'lazarus-r15a-production-character-v1',originalsPreserved:true,
  frame:{width:W,height:H,count:9,baselineY:FOOT,paddingMin:PAD,sheet:[W*9,H]},
  sourceProvenance:sourcePaths,poses:{},releaseAssets:[]};
for(let i=0;i<poses.length;i++){
 const [name,key,description]=poses[i];
 const source=key==='journey'?stripFrames[i]:read[key];
 const rect=bounds(source).rect;
 if(!rect)throw Error('Missing alpha in '+name);
 const cut=cropData(source,rect,Math.max(1,Math.floor(source.width/120)));
 const headroom=name==='read'?107:(/^step/.test(name)?117:125);
 const fit=await renderOnFrame(cut,W,H,headroom,FOOT);
 for(let y=0;y<H;y++)fit.data.copy(sheet,y*W*9*4+i*W*4,y*W*4,(y+1)*W*4);
 const bytes=await encode(fit);
 await writeFile(join(output,'pose-'+name+'.webp'),bytes);
 manifest.poses[name]={slot:i,source:key,description,normalizedRect:bounds(fit).rect,
   footAnchor:fit.foot,targetSize:fit.fitted,origin:fit.origin,sha256:sha(bytes),
   status:name==='reach'?'legacy-keyframe-needs-narrative-redraw':'source-derived-genuine-pose'};
 manifest.releaseAssets.push('pose-'+name+'.webp');
}
const composite={data:sheet,width:W*9,height:H};
const assembled=await encode(composite);
await writeFile(join(output,'paperkeeper-journey-r15a.webp'),assembled);
manifest.sheetSha256=sha(assembled);
manifest.releaseAssets.push('paperkeeper-journey-r15a.webp');
// Five new scene-specific illustrated action drawings, generated as distinct
// R15A concept source from the approved Paperkeeper art direction. A real
// picture with different limb/lantern/page silhouettes, not frame renaming.
const narrativeSource=join(output,'source','narrative-poses-raw.webp');
const narrativeBytes=await readFile(narrativeSource);
const narrativeMeta=await sharp(narrativeBytes).metadata();
if(narrativeMeta.width!==560||narrativeMeta.height!==136)
 throw Error('Expected five illustrated 112×136 action cells; got '+
   narrativeMeta.width+'×'+narrativeMeta.height);
const storyNames=['look-down','set-lantern','reach','lift','carry'];
manifest.storyFrame={width:128,height:144,count:5,baselineY:133,sheet:[640,144]};
manifest.storySource={path:'storybook/assets/characters/r15a/source/narrative-poses-raw.webp',
 sha256:sha(narrativeBytes),bytes:narrativeBytes.length,method:'new AI-assisted colored-pencil storybook drawings, 5 distinct action silhouettes'};
manifest.storyPoses={};
const storyRaw={data:Buffer.alloc(640*144*4),width:640,height:144};
for(let i=0;i<storyNames.length;i++){
 const name=storyNames[i];
 const cell=await sharp(narrativeBytes).extract({left:i*112,top:0,width:112,height:136})
   .ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const candidate=fix({data:Buffer.from(cell.data),width:112,height:136});
 const rect=bounds(candidate).rect;
 if(!rect)throw Error('Blank art in new pose '+name);
 const cut=cropData(candidate,rect,2);
 const pose=await renderOnFrame(cut,128,144,125,133);
 for(let y=0;y<144;y++)pose.data.copy(storyRaw.data,y*640*4+i*128*4,y*128*4,(y+1)*128*4);
 const bytes=await encode(pose,{quality:85});
 await writeFile(join(output,'story-'+name+'.webp'),bytes);
 manifest.storyPoses[name]={slot:i,sourceCell:i,sha256:sha(bytes),
  groundline:133,alphaRect:bounds(pose).rect,status:'new-narrative-illustration'};
 manifest.releaseAssets.push('story-'+name+'.webp');
}
const storySheet=await encode(storyRaw,{quality:88});
await writeFile(join(output,'narrative-journey-r15a.webp'),storySheet);
manifest.storySheetSha256=sha(storySheet);
manifest.releaseAssets.push('narrative-journey-r15a.webp');
const entranceCrop=cropData(read.hero,bounds(read.hero).rect,4);
const entranceFrame=await renderOnFrame(entranceCrop,622,960,911,938);
const entrance=await encode(entranceFrame,{quality:91});
await writeFile(join(output,'entrance-r15a.webp'),entrance);
manifest.releaseAssets.push('entrance-r15a.webp');
manifest.entrance={sha256:sha(entrance),size:[622,960],baselineY:938,
 source:'storyboard/r02/exports/paperkeeper.three-quarter.webp'};
const reader=await encode(await renderOnFrame(cropData(read.reader,bounds(read.reader).rect,1),128,144,118,133));
await writeFile(join(output,'reader-r15a.webp'),reader);
manifest.releaseAssets.push('reader-r15a.webp');
for(const [kind,color] of Object.entries({
 paper:[247,233,214],dark:[30,48,43],river:[90,140,175],black:[4,6,5]
})){
 const back=Buffer.alloc(composite.width*composite.height*4);
 for(let k=0;k<back.length;k+=4){back[k]=color[0];back[k+1]=color[1];back[k+2]=color[2];back[k+3]=255;}
 const base=await sharp(back,{raw:{width:composite.width,height:composite.height,channels:4}})
 .png().toBuffer();
 const png=await sharp(base).composite([{input:await toRgba(composite),top:0,left:0}]).png().toBuffer();
 await writeFile(join(output,'proof-'+kind+'.png'),png);
 manifest.releaseAssets.push('proof-'+kind+'.png');
 const storyBackdrop=Buffer.alloc(storyRaw.width*storyRaw.height*4);
 for(let i=0;i<storyBackdrop.length;i+=4){
  storyBackdrop[i]=color[0];storyBackdrop[i+1]=color[1];storyBackdrop[i+2]=color[2];storyBackdrop[i+3]=255;
 }
 const storyPng=await sharp(storyBackdrop,{raw:{width:storyRaw.width,height:storyRaw.height,channels:4}})
   .png().toBuffer();
 const composited=await sharp(storyPng).composite([{input:await toRgba(storyRaw),left:0,top:0}]).png().toBuffer();
 await writeFile(join(output,'proof-story-'+kind+'.png'),composited);
 manifest.releaseAssets.push('proof-story-'+kind+'.png');
}
await writeFile(join(doc,'ASSET-AUDIT.json'),JSON.stringify(audit,null,2)+'\n');
await writeFile(join(doc,'ANCHOR-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('R15A OUTPUT',JSON.stringify({count:manifest.releaseAssets.length,poses:Object.keys(manifest.poses),
  flags:Object.entries(manifest.poses).filter(([,v])=>v.status.includes('needs')),
  sheet:manifest.frame,story:manifest.storyFrame,hero:manifest.entrance},null,2));
