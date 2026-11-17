/** Mechanical sprite extraction, registration and WebP encoding. No painted edits. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../storybook/assets/entrance/r03/', import.meta.url));
const timeline = JSON.parse(await readFile(path.join(root, 'timeline.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const canvas = timeline.canvas;

async function inspect(bytes) {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const { width, height } = info;
  let left=width, right=0, top=height, bottom=0, transparent=0;
  let lightPixels=0,lightX=0,lightY=0;
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
    const alpha = data[(y*width+x)*4+3];
    if (alpha===0) transparent++;
    if (alpha>32) { left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y); }
    const offset=(y*width+x)*4;
    if (x>=width*.78&&y>=height*.385&&y<height*.865&&alpha>128&&data[offset]>235&&data[offset+1]>160&&data[offset+1]<245&&data[offset+2]<180) {
      lightPixels++;lightX+=x;lightY+=y;
    }
  }
  // Shoes/legs are the only marks in the lowest 10% of the standing silhouette.
  const bandTop = Math.round(bottom-(bottom-top)*.1);
  const occupied = [];
  for (let x=0;x<width;x++) {
    let pixels=0;
    for (let y=bandTop;y<=bottom;y++) if (data[(y*width+x)*4+3]>128) pixels++;
    if (pixels>=3) occupied.push(x);
  }
  const groups=[];
  for (const x of occupied) {
    if (!groups.length || x-groups.at(-1).right>3) groups.push({left:x,right:x});
    else groups.at(-1).right=x;
  }
  const shoes=groups.filter(g=>g.right-g.left>=10).sort((a,b)=>a.left-b.left);
  assert.equal(shoes.length,2,'Two independent planted shoes must be identifiable');
  for (const shoe of shoes) shoe.center=(shoe.left+shoe.right)/2;
  const lanternHighlight=lightPixels?{x:Number((lightX/lightPixels).toFixed(2)),y:Number((lightY/lightPixels).toFixed(2)),pixels:lightPixels}:null;
  return {width,height,sha256:hash(bytes),bytes:bytes.length,bounds:{left,top,right,bottom},transparentFraction:Number((transparent/(width*height)).toFixed(5)),feet:{baseline:bottom,pivotX:(shoes[0].center+shoes[1].center)/2,span:shoes[1].center-shoes[0].center,shoes},lanternHighlight};
}

async function frameInput(frame) {
  const bytes=await readFile(path.join(root,frame.source));
  const m=await sharp(bytes).metadata();
  if (frame.cell===null) return {bytes,source:{path:frame.source,sha256:hash(bytes),width:m.width,height:m.height},crop:null};
  assert.equal(m.width,1536,'Production strip width');
  assert.equal(m.height,1024,'Production strip height');
  const crop={left:frame.cell*768,top:0,width:768,height:1024};
  return {bytes:await sharp(bytes).extract(crop).png().toBuffer(),source:{path:frame.source,sha256:hash(bytes),width:m.width,height:m.height},crop};
}

if (process.argv.includes('--check')) {
  const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
  assert.equal(manifest.timelineSha256,hash(await readFile(path.join(root,'timeline.json'))),'Timeline drift requires re-export');
  const hashes=new Set();
  let totalBytes=0;
  for (const frame of manifest.frames) {
    assert.equal(hash(await readFile(path.join(root,frame.source.path))),frame.source.sha256,'Production source integrity: '+frame.id);
    const actual=await inspect(await readFile(path.join(root,frame.export.path)));
    assert.deepEqual(actual,frame.export.metrics,'Export integrity: '+frame.id);
    assert.equal(actual.width,canvas.width);
    assert.equal(actual.height,canvas.height);
    assert.ok(actual.transparentFraction>.28,'Real transparent background: '+frame.id);
    assert.ok(actual.bounds.left>0&&actual.bounds.right<canvas.width-1&&actual.bounds.top>0,'No clipped silhouette: '+frame.id);
    assert.ok(Math.abs(actual.feet.baseline-manifest.registration.baseline)<=1,'Registered ground: '+frame.id);
    assert.ok(Math.abs(actual.feet.pivotX-manifest.registration.pivotX)<=2,'Registered feet pivot: '+frame.id);
    assert.ok(Math.abs(actual.feet.span/manifest.registration.footSpan-1)<.1,'Stable foot spacing: '+frame.id);
    hashes.add(actual.sha256);
    totalBytes+=actual.bytes;
  }
  assert.equal(hashes.size,timeline.frames.length,'Every acting drawing must be distinct');
  assert.ok(totalBytes<2_000_000,'Complete action payload budget: '+totalBytes);
  for (const [name,steps] of Object.entries(timeline.clips)) {
    for (const step of steps) { assert.ok(timeline.frames.some(f=>f.id===step.frame));assert.ok(step.duration>=80&&step.duration<=400); }
    assert.equal(steps.at(-1).frame,timeline.settled,name+' ends in a stable final pose');
  }
  assert.ok(!timeline.clips.acknowledge.some(x=>x.frame===timeline.neutral),'Replay must not jump to the lowered lantern');
  // Measure the drawing's light, rather than inferring movement from filenames.
  const lamp=id=>manifest.frames.find(f=>f.id===id).export.metrics.lanternHighlight;
  assert.ok(lamp('neutral').y-lamp('settled').y>180,'Visible upward lantern gesture');
  assert.ok(lamp('lift-low').y-lamp('lift-mid').y>40&&lamp('lift-mid').y-lamp('overshoot').y>40,'Authored lift arc');
  assert.ok(lamp('follow').y>lamp('overshoot').y,'Overshoot resolves downwards');
  assert.ok(Math.abs(lamp('settled').y-lamp('follow').y)<15,'Restrained final settle');
  assert.ok(Math.hypot(lamp('acknowledge').x-lamp('settled').x,lamp('acknowledge').y-lamp('settled').y)<8,'Replay keeps the lantern raised and steady');
  console.log(`PASS R03 assets: ${hashes.size} distinct transparent frames, planted feet, source hashes and ${totalBytes} bytes.`);
} else {
  await mkdir(path.join(root,'exports'),{recursive:true});
  const neutralInput=await frameInput(timeline.frames[0]);
  const neutral=await inspect(neutralInput.bytes);
  const reference=await inspect((await frameInput(timeline.frames[1])).bytes);
  // One scale for all acting frames preserves head dips and follow-through.
  const scale=(neutral.feet.baseline-neutral.bounds.top)/(reference.feet.baseline-reference.bounds.top);
  const frames=[];
  for (const frame of timeline.frames) {
    const input=await frameInput(frame);
    const output='exports/'+frame.id+'.webp';
    let registration={scale:1,offsetX:0,offsetY:0};
    if (frame.cell===null) await copyFile(path.join(root,frame.source),path.join(root,output));
    else {
      const resized=await sharp(input.bytes).resize({width:Math.round(768*scale),height:Math.round(1024*scale)}).png().toBuffer();
      const bounds=await inspect(resized);
      const offsetX=Math.round(neutral.feet.pivotX-bounds.feet.pivotX);
      const offsetY=neutral.feet.baseline-bounds.feet.baseline;
      registration={scale,offsetX,offsetY};
      // Extract/pad transparent margins only. Never crop a visible character mark.
      assert.ok(bounds.bounds.left+offsetX>=0&&bounds.bounds.right+offsetX<canvas.width,frame.id+' horizontal silhouette fits');
      assert.ok(bounds.bounds.top+offsetY>=0&&bounds.bounds.bottom+offsetY<canvas.height,frame.id+' vertical silhouette fits');
      const left=Math.max(0,-offsetX),top=Math.max(0,-offsetY);
      const width=Math.min(bounds.width-left,canvas.width-Math.max(0,offsetX));
      const height=Math.min(bounds.height-top,canvas.height-Math.max(0,offsetY));
      await sharp(resized).extract({left,top,width,height}).extend({left:Math.max(0,offsetX),top:Math.max(0,offsetY),right:canvas.width-width-Math.max(0,offsetX),bottom:canvas.height-height-Math.max(0,offsetY),background:{r:0,g:0,b:0,alpha:0}}).webp({quality:86,alphaQuality:100,effort:6}).toFile(path.join(root,output));
    }
    frames.push({id:frame.id,intent:frame.intent,orientation:timeline.orientation,source:input.source,crop:input.crop,registration,export:{path:output,metrics:await inspect(await readFile(path.join(root,output)))}});
  }
  const manifest={revision:'R03',action:timeline.action,authored:'2026-11-17',method:'OpenAI image_gen: authored full-body poses. Sharp: mechanical cell extraction, shared-scale registration and WebP encoding only.',timelineSha256:hash(await readFile(path.join(root,'timeline.json'))),canvas,registration:{baseline:neutral.feet.baseline,pivotX:neutral.feet.pivotX,footSpan:neutral.feet.span},converter:{sharp:sharp.versions.sharp,webp:sharp.versions.webp},clips:timeline.clips,frames};
  await writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  // Reuse the R02 URL for neutral so R04 can keep its already loaded fallback.
  const frameLines=timeline.frames.map(f=>{
    const file=f.id===timeline.neutral?'r02/exports/paperkeeper.three-quarter.webp':`r03/exports/${f.id}.webp`;
    return `    { id: '${f.id}', src: new URL('../../storybook/assets/entrance/${file}', import.meta.url).href },`;
  }).join('\n');
  const module=`// Generated by scripts/forest_r03_assets.mjs; URLs remain statically analyzable by Vite.\nexport const entranceActing = {\n  canvas: ${JSON.stringify(canvas)},\n  neutral: '${timeline.neutral}',\n  settled: '${timeline.settled}',\n  registration: ${JSON.stringify(manifest.registration)},\n  frames: [\n${frameLines}\n  ],\n  clips: ${JSON.stringify(timeline.clips,null,2)}\n};\n`;
  await writeFile(new URL('../src/storybook/entrance-acting-assets.js',import.meta.url),module);
  console.log(frames.map(f=>`${f.id}: ${f.export.metrics.bytes} bytes; baseline ${f.export.metrics.feet.baseline}; pivot ${f.export.metrics.feet.pivotX}`).join('\n'));
}
