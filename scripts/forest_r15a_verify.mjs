/** R15A — static source, alpha and anchor integrity gate. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const root=resolve(import.meta.dirname,'..');
const doc=JSON.parse(await readFile(resolve(root,'docs/forest/revision/r15a/ANCHOR-MANIFEST.json'),'utf8'));
const audit=JSON.parse(await readFile(resolve(root,'docs/forest/revision/r15a/ASSET-AUDIT.json'),'utf8'));
const dir=resolve(root,'storybook/assets/characters/r15a');
assert.equal(doc.schema,'lazarus-r15a-production-character-v1');
assert.deepEqual(doc.frame,{width:128,height:144,count:9,baselineY:133,paddingMin:8,sheet:[1152,144]});
const names=['step-a','step-b','step-c','stand','turn','look','reach','read','lantern'];
assert.deepEqual(Object.keys(doc.poses),names);
assert.ok(doc.originalsPreserved);
const hash=x=>createHash('sha256').update(x).digest('hex');
const sheet=await readFile(resolve(dir,'paperkeeper-journey-r15a.webp'));
assert.equal(hash(sheet),doc.sheetSha256);
const meta=await sharp(sheet).metadata();
assert.equal(meta.width,1152);assert.equal(meta.height,144);
for(const pose of names){
 const p=doc.poses[pose],file=await readFile(resolve(dir,'pose-'+pose+'.webp'));
 assert.equal(hash(file),p.sha256);
 const a=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(a.info.width,128);assert.equal(a.info.height,144);
 const [left,top,right,bottom]=p.normalizedRect;
 assert.ok(left>=8&&top>=8&&right<=120&&bottom<=136,pose+' cropped too tightly '+p.normalizedRect);
 assert.ok(Math.abs(p.footAnchor[1]-133)<=1,pose+' foot registered inconsistently');
 assert.ok(a.data[3]===0&&a.data[(128*144-1)*4+3]===0,pose+' corners not transparent');
}
const legacy=doc.poses.reach;
assert.match(legacy.status,/needs-narrative-redraw/,'never call a seated book pose a new drawn lift');
const old=JSON.parse(await readFile(resolve(root,'storybook/assets/characters/manifest.json'),'utf8'));
assert.equal(old.asset_count,13,'original Stage 05 archive untouched');
assert.equal(Object.keys(audit.raw).length,10);
assert.ok(audit.raw.journey.after.edgeWhite<audit.raw.journey.before.edgeWhite,'edge halo improvement must be measured');
for(const htmlName of ['index.html','storybook/index.html']){
 const h=await readFile(resolve(root,htmlName),'utf8');
 assert.ok(h.includes('r15a/entrance-r15a.webp'),htmlName+' new entrance missing');
 assert.ok(h.includes('r15a/reader-r15a.webp'),htmlName+' new reader missing');
 for(const s of ['path','clearing','river','house'])assert.equal(h.split('data-walk="'+s+'"').length-1,1);
}
const css=await readFile(resolve(root,'src/storybook/styles/keeper-journey.css'),'utf8');
assert.ok(css.includes('r15a/paperkeeper-journey-r15a.webp'));
assert.ok(css.includes('translate: -50% 7.63889%'));
assert.ok(css.includes('.river-stone-nav')&&css.includes('top:calc(100% + 12px)'));
console.log('PASS R15A static: source manifest, nine alpha-safe frames, original archive, two routes, measured edge matte reduction, shared groundline');
