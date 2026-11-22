/** Lazarus V3 source and native-scroll contract; independent of browser dependencies. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {clamp01,progressWithin,phaseAt,stageProgress,isCompactLayout} from '../src/storybook/narrative-math.js';
const file=p=>readFileSync(resolve(import.meta.dirname,'..',p),'utf8');
assert.deepEqual([clamp01(-7),clamp01(.25),clamp01(10),clamp01(NaN)],[0,.25,1,0]);
assert.equal(progressWithin(10000,1000,800),0);
assert.equal(progressWithin(-3000,1000,800),1);
assert.ok(progressWithin(200,1000,800)<progressWithin(-200,1000,800));
assert.deepEqual([0,.23,.24,.53,.54,.9].map(p=>phaseAt(p,[0,.24,.54,.82])),[0,0,1,1,2,3]);
assert.ok(stageProgress(-200,1440,900,true)>stageProgress(-50,1440,900,true));
assert.ok(Math.abs(stageProgress(-206.7,1440,900,true)-.3828)<.001);
assert.ok(Math.abs(stageProgress(-408.2,1440,900,true)-.7559)<.001);
assert.deepEqual([670,671,760,761].map(width=>isCompactLayout(width,900)),[true,false,false,false]);
assert.ok(isCompactLayout(844,390) && !isCompactLayout(761,651));
const living=file('src/storybook/living-paperkeeper.js');
assert.ok(living.includes('lazarus:storyframe') && living.includes('document.body.append(guide)'));
assert.ok(living.includes('safePosition') && living.includes('collision'));
assert.ok(living.includes('source.decode()'),'asset gate must preserve fallback');
const walker=file('src/storybook/keeper-journey.js');
assert.ok(walker.includes('snapshot.progress[kind]'),'walker must consume director progress');
assert.ok(walker.includes('lazarus:storyframe'),'walker must share director frame');
assert.ok(!/new\s+IntersectionObserver\s*\(/.test(walker),'no separate observer writer');
const engine=file('src/storybook/narrative-director.js');
const styles=file('src/storybook/styles/narrative-v3.css');
const chapterIds=['entrance','winding-path','work-clearing','river-stories','house-on-the-hill'];
for(const id of chapterIds)assert.ok(engine.includes(id),'V3 engine misses '+id);
for(const cls of ['v3-entrance-scroll','v3-path-scroll','v3-river-scroll','v3-reading-marker','v3-beat-note']){
 assert.ok(engine.includes(cls),'engine missing '+cls);
 assert.ok(styles.includes(cls),'styles missing '+cls);
}
assert.ok(engine.includes('requestAnimationFrame(render)'),'missing frame batching');
assert.ok(engine.includes('lazarus:storyframe'),'missing authoritative progress snapshot');
assert.ok(engine.includes('prefers-reduced-motion: reduce'),'missing motion preference');
assert.ok(styles.includes('prefers-reduced-motion:reduce'),'missing fallback');
assert.ok(!engine.includes('scrollTo(')&&!engine.includes('preventDefault('),'must keep native scroll');
for(const [htmlPath,prefix] of [['index.html','./src/storybook'],['storybook/index.html','../src/storybook']]){
 const html=file(htmlPath);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,htmlPath+' H1 contract');
 for(const id of chapterIds)assert.ok(html.includes('id="'+id+'"'),htmlPath+' missing '+id);
 for(const src of [prefix+'/styles/narrative-v3.css',prefix+'/narrative-director.js']){
   assert.equal(html.split(src).length-1,1,htmlPath+' missing/duplicate '+src);
 }
 for(const id of ['field-atlas','atrium-room-template','studio-inquiry'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('concept work — not client commissions.'),'concept provenance lost');
}
console.log('PASS V3: native scroll, five chapters, two routes, motion fallback, retained actions.');
