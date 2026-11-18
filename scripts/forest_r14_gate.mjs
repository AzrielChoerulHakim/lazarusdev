import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),path=p=>resolve(root,p),read=p=>readFileSync(path(p),'utf8');
const doc=JSON.parse(read('docs/forest/revision/r14/COMPOSITION-CONTRACT.json'));
assert.equal(doc.schema,'lazarus-r14-production-composition-v1');assert.equal(doc.chapters.length,5);
assert.equal(doc.acceptance.art_direction,'NOT SIGNED OFF');
const names=new Set(),sheet=read('docs/forest/revision/r14/comparison.html');
for(const [i,scene] of doc.chapters.entries()){
 assert.equal(scene.id,['entrance','path','clearing','river','house'][i]);
 assert.ok(scene.light&&scene.signature&&scene.safe&&scene.narrative);
 for(const points of [scene.desktopFoot,scene.mobileFoot]){assert.ok(points.length);for(const [x,y] of points)assert.ok(x>=0&&x<=100&&y>=0&&y<=100)}
 assert.ok(scene.focal.every(v=>v>=0&&v<=100));
 for(const [field,w,h] of [['desktop_png',1440,900],['mobile_png',390,844]]){
  const n=scene[field],f=doc.evidence.source+'/'+n;
  assert.ok(!names.has(n));names.add(n);assert.ok(sheet.includes('../r13/evidence/'+n));
  assert.ok(existsSync(path(f)),'Frozen screenshot missing '+f);
  const buf=readFileSync(path(f));assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(buf.readUInt32BE(16),w);assert.equal(buf.readUInt32BE(20),h);
 }
}
assert.equal(names.size,10);
const css=read('src/storybook/styles/composition-r14.css');
assert.ok(css.includes('top:calc(100% + 15px)')&&css.includes('margin-bottom:112px'));
for(const f of ['index.html','storybook/index.html']){
 const html=read(f);assert.ok(html.includes('styles/composition-r14.css'),f+' has no R14 CSS');
 assert.ok(html.includes('id="river-stories"')&&html.includes('id="house-on-the-hill"'));
}
console.log('PASS R14: ten authentic 1440/390 browser PNG references, five distinct scene contracts, both route styles, externalized portrait river nav. Human art sign-off NOT VERIFIED.');