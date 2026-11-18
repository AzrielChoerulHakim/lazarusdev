/** R15 / Real browser contract and production screenshot evidence.
 * Tests both published routes and critical responsive geometries.
 * Optional R15_CAPTURE_DIR records genuinely rendered Chromium PNG frames.
 * Never claims a physical-device or subjective visual sign-off.
 */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const capture=process.env.R15_CAPTURE_DIR?resolve(process.env.R15_CAPTURE_DIR):null;
const captureData={schema:'lazarus-r15-rendered-v1',sourceCommit:process.env.GIT_SHA||'LOCAL',browser:'Chromium',source:'real Vite build',routes:[],errors:[]};
const browser=await chromium.launch({headless:true,...(process.env.CI?{channel:'chrome'}:{}),args:['--no-sandbox']});
async function capturePng(page,folder,name,selector) {
  if (!capture) return;
  const output=join(capture,folder,name+'.png');
  await mkdir(resolve(output,'..'),{recursive:true});
  const buffer=await page.locator(selector).screenshot({path:output,animations:'disabled'});
  captureData.routes.push({folder,name,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
}
async function setLight(page,value) {
  await page.locator('#atrium-light').evaluate((el,v)=>{
    el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));
  },value);
  await page.waitForFunction(v=>document.querySelector('#atrium-light-value')?.textContent===v+'%',value);
}
async function geometry(page) {
  return page.locator('#atrium-scene').evaluate(scene=>({
    lightZone:scene.dataset.lightZone,
    left:scene.querySelector('[data-atrium-shadow="left-core"]')?.getAttribute('d'),
    right:scene.querySelector('[data-atrium-shadow="right-core"]')?.getAttribute('d'),
    leftSoft:scene.querySelector('[data-atrium-shadow="left-penumbra"]')?.getAttribute('d'),
    beamX1:scene.querySelector('#atrium-relief-beam')?.getAttribute('x1'),
    beamX2:scene.querySelector('#atrium-relief-beam')?.getAttribute('x2'),
    etched:scene.style.getPropertyValue('--relief-raking'),
    value:document.querySelector('#atrium-light')?.value
  }));
}
try{
for(const route of ['/lazarusdev/','/lazarusdev/storybook/']) {
  for(const [width,height] of [[390,844],[1440,900],[844,390]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+route,{waitUntil:'domcontentloaded'});
    await page.locator('#entrance .button-primary[href="#work-clearing"]').click();
    const shortcut=page.locator('.atrium-clearing-shortcut');
    assert.equal(await shortcut.count(),1);
    assert.equal(await page.locator('.work-hanging[data-open-concept="oracle"]').count(),1);
    assert.equal(await page.locator('.work-hanging[data-open-concept="archive"]').count(),1);
    await shortcut.scrollIntoViewIfNeeded();
    const folder=(route.includes('storybook')?'storybook':'root')+'/'+width+'x'+height;
    await capturePng(page,folder,'poster-atrium','.work-hanging[data-open-concept="atrium"]');
    await shortcut.scrollIntoViewIfNeeded();
    await page.evaluate(()=>{const g=document.querySelector('.work-hangings');g.scrollLeft=Math.min(65,Math.max(0,g.scrollWidth-g.clientWidth));});
    const before=await page.evaluate(()=>({y:scrollY,x:document.querySelector('.work-hangings').scrollLeft}));
    await shortcut.click();
    await page.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===false);
    assert.equal(new URL(page.url()).hash,'#atrium');
    assert.equal(await page.locator('#atrium-room[role="dialog"][aria-modal="true"]').count(),1);
    assert.equal(await page.locator('#atrium-scene [data-portal-silhouette="pointed"]').count(),1);
    assert.equal(await page.locator('#atrium-scene [data-atrium-layer]').count(),4);
    assert.equal(await page.evaluate(()=>document.querySelector('main')?.inert),true,'background must be inert while dialog is open');
    await page.waitForTimeout(530); // entry transition completes before recording images
    const states=[];
    for(const value of [0,50,100]) {
      await setLight(page,value);
      await page.waitForTimeout(125);
      const state=await geometry(page);
      assert.ok(state.left&&state.right&&state.leftSoft&&state.beamX1&&state.etched);
      states.push(state);
      // Capture the fixed viewport, not the oversized inner scroll element:
      // an element screenshot could include page pixels OUTSIDE the dialog.
      await capturePng(page,folder,'atrium-light-'+value,'#atrium-room');
    }
    assert.equal(new Set(states.map(x=>x.left)).size,3,'left projection must change with light');
    assert.equal(new Set(states.map(x=>x.right)).size,3,'right projection must change with light');
    assert.equal(new Set(states.map(x=>x.beamX1)).size,3,'raking reveal must move with light');
    assert.equal(new Set(states.map(x=>x.etched)).size,3,'pigment reveal must vary spatially');
    assert.deepEqual(states.map(x=>x.lightZone),['left','center','right']);
    assert.match(await page.locator('#atrium-light-message').textContent(),/engraved leaves/);
    await page.locator('[data-light-step="-10"]').click();
    assert.equal(await page.locator('#atrium-light-value').textContent(),'90%');
    await page.locator('[data-light-step="10"]').click();
    assert.equal(await page.locator('#atrium-light-value').textContent(),'100%');
    if (width===844 && height===390) {
      const controls=await page.locator('#atrium-light').boundingBox();
      assert.ok(controls && controls.y >= 0 && controls.y+controls.height <= height + 2,
        'Short-landscape slider must be visible beside the illustrated room '+JSON.stringify(controls));
    }
    const region=await page.locator('#atrium-scene').boundingBox();
    assert.ok(region&&region.height>=200,'atrium stage too small: '+JSON.stringify(region));
    const y=region.y+Math.min(region.height*.5,Math.max(50,height-region.y-25));
    await page.mouse.move(region.x+region.width*.13,y);
    await page.mouse.down();
    await page.mouse.move(region.x+region.width*.91,y,{steps:6});
    await page.mouse.up();
    assert.ok(Number(await page.locator('#atrium-light').inputValue())>=80,'single horizontal drag should reveal engraved leaves');
    await page.locator('[data-atrium-close]').focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-light-step')),'10','focus must cycle inside dialog');
    await page.goBack();
    await page.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===true);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const after=await page.evaluate(()=>({y:scrollY,x:document.querySelector('.work-hangings').scrollLeft,
      focus:document.activeElement?.matches('[data-atrium-enter]'),inert:document.querySelector('main')?.inert}));
    assert.ok(Math.abs(before.y-after.y)<6,'restoration scroll '+JSON.stringify({before,after}));
    assert.ok(Math.abs(before.x-after.x)<2,'restoration gallery '+JSON.stringify({before,after}));
    assert.equal(after.focus,true,'focus restore');
    assert.equal(after.inert,false,'restore background inert state');
    assert.deepEqual(errors,[],'runtime errors '+route+' '+width);
    console.log('PASS R15',route,width,height,'light/shadow/drag/focus/return');
    await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(origin+route,{waitUntil:'domcontentloaded'});
  await reduced.locator('.atrium-clearing-shortcut').scrollIntoViewIfNeeded();
  await reduced.locator('.atrium-clearing-shortcut').click();
  await reduced.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===false);
  assert.equal(await reduced.locator('#atrium-room').evaluate(node=>getComputedStyle(node.querySelector('.atrium-frame')).animationName),'none');
  await reduced.keyboard.press('Escape');
  await reduced.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===true);
  await reduced.goto(origin+route+'#atrium');
  assert.equal(await reduced.locator('#atrium-room').isVisible(),true);
  await reduced.locator('[data-atrium-close]').click();
  await reduced.waitForFunction(()=>document.querySelector('#atrium-room')?.hidden===true);
  await reduced.close();
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const p=await noJs.newPage();await p.goto(origin+route);
  assert.equal(await p.locator('.work-hanging[data-open-concept="atrium"]').count(),1);
  assert.equal(await p.locator('#folio-atrium .atrium-note-entry').count(),1);
  await noJs.close();
}
} finally {
  await browser.close();
}
if(capture) {
  await mkdir(capture,{recursive:true});
  await writeFile(join(capture,'manifest.json'),JSON.stringify(captureData,null,2)+'\n');
  assert.equal(captureData.routes.length,24,'2 routes × 3 viewports × 4 images');
}
console.log('PASS R15: both routes, 3 viewports, physical scene geometry, one-drag reveal, reduced motion, direct hash, keyboard and Back. ART SIGN-OFF NOT VERIFIED.');
