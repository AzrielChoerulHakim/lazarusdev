import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  // GitHub-hosted Ubuntu already ships Google Chrome. Using it avoids a
  // second 300 MB Playwright-browser download that can stall visual CI.
  ...(process.env.CI ? {channel:'chrome'} : {}),
  headless: true,
  args: ['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'],
});
const dir = 'docs/qa';
await mkdir(dir,{recursive:true});
try {
  const scenes = [
    { name:'hero-desktop', width:1440,height:900, section:'origin', extra:0 },
    { name:'passage-desktop', width:1440,height:900, section:'passage', extra:.06 },
    { name:'crossing-desktop', width:1440,height:900, section:'passage', extra:1.60 },
    { name:'worlds-desktop', width:1440,height:900, section:'worlds', extra:.03 },
    { name:'hero-mobile', width:390,height:844, section:'origin', extra:0 },
    { name:'passage-mobile', width:390,height:844, section:'passage', extra:.04 },
  ];
  for (const item of scenes) {
    const page=await browser.newPage({viewport:{width:item.width,height:item.height}, deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.sceneAsset==='scanned' && document.documentElement.dataset.sceneMaterial==='photographic' && document.documentElement.dataset.lunarAsset==='nasa',null,{timeout:30000});
    await page.evaluate(({section,extra})=>{
      const el=document.getElementById(section);
      scrollTo({top: el.offsetTop + innerHeight*extra, behavior:'instant'});
    },item);
    await page.waitForFunction(() => document.documentElement.dataset.webgl === 'ready',null,{timeout:15000});
    await page.waitForTimeout(item.width > 800 ? 4800 : 2200);
    if(errors.length)throw Error(item.name+': '+errors.join('; '));
    await page.screenshot({path:`${dir}/${item.name}.jpg`,type:'jpeg',quality:72,animations:'disabled'});
    const status=await page.evaluate(()=>({fracture:document.documentElement.dataset.fracture,renderer:document.documentElement.dataset.renderTier,scan:document.documentElement.dataset.sceneAsset,stone:document.documentElement.dataset.sceneMaterial,lunar:document.documentElement.dataset.lunarAsset,projection:window.__lazarusDebug?.(),scrollY:scrollY}));
    if (status.fracture !== 'three-levitating-sections' || status.projection.statueFragments !== 3 || status.projection.scanRootCount !== 1 || status.projection.syntheticBustCount !== 0) throw Error(item.name + ': exclusive three-piece scan is missing or duplicated: ' + JSON.stringify(status.projection));
    const projection = status.projection;
    if (projection.surrealWorld?.flowingPendants !== 5
      || projection.surrealWorld?.stairTreads !== 26
      || projection.surrealWorld?.lunar?.hemispheres !== 2) {
      throw Error(item.name + ': surreal landscape did not finish loading: ' + JSON.stringify(projection.surrealWorld));
    }
    if (!projection || projection.camera.some(v => !Number.isFinite(v) || Math.abs(v) > 90)) {
      throw Error(item.name + ': runaway / nonfinite camera: ' + JSON.stringify(projection));
    }
    if (item.section === 'origin' && !projection.statue.visible) {
      throw Error(item.name + ': scanned sculpture is outside the hero camera');
    }
    if (item.name === 'crossing-desktop' && projection.impossiblePortal.transitionBlend < .55) {
      throw Error('Crossing screenshot never revealed the sunlit second world: ' + JSON.stringify(projection.impossiblePortal));
    }
    if (item.section === 'worlds' && projection.impossiblePortal.transitionBlend < .85) {
      throw Error('Gallery lost the second reality immediately after the crossing: ' + JSON.stringify(projection.impossiblePortal));
    }
    if (item.name.startsWith('passage-') && !projection.portal.visible) {
      throw Error(item.name + ': portal is outside the threshold camera');
    }
    console.log(item.name+' captured with '+JSON.stringify(status));
    await page.close();
  }
}finally{await browser.close();}
