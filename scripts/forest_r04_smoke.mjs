/** R04: built-site Chromium verification; text only, no screenshots/video. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin=process.env.STORYBOOK_PREVIEW_ORIGIN||'http://127.0.0.1:4186';
const routes=['/lazarusdev/','/lazarusdev/storybook/'];
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.env.CI?{channel:'chrome'}:{}),headless:true,args:['--no-sandbox']});
let passed=0;
async function setup(route,opts={}) {
  const {width=390,height=844,reducedMotion='no-preference',javaScriptEnabled=true,blockFrame=false}=opts;
  const context=await browser.newContext({viewport:{width,height},reducedMotion,javaScriptEnabled});
  if(blockFrame)await context.route('**/*lift-mid*.webp',r=>r.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(origin+route,{waitUntil:'networkidle'})).status(),200);
  return {context,page,errors};
}
try {
  for (const route of routes) for (const options of [
    {width:1440,height:900}, {width:320}, {reducedMotion:'reduce'}, {blockFrame:true}, {javaScriptEnabled:false}
  ]) {
    const {context,page,errors}=await setup(route,options);
    try {
      const gate=page.locator('.entrance-paperkeeper');
      await gate.scrollIntoViewIfNeeded();
      if (options.javaScriptEnabled !== false) {
        await page.waitForFunction(expected=>document.querySelector('.entrance-paperkeeper').dataset.actingState===expected,
          options.blockFrame?'unavailable':'settled', {timeout:25000});
        if (options.blockFrame) assert.match(await gate.getAttribute('src'),/paperkeeper.three-quarter/);
        else assert.equal(await gate.getAttribute('data-acting-frame'),'settled');
        await page.locator('.hero-atlas-cue').click();
      } else {
        await page.locator('#field-atlas summary').focus();
        await page.keyboard.press('Enter');
      }
      assert.equal(await page.locator('#field-atlas').evaluate(el=>el.open),true);
      assert.equal(await page.locator('.field-atlas-trail').first().evaluate(el=>getComputedStyle(el).animationName),'none');
      assert.equal(await page.locator('.field-atlas-paperkeeper').getAttribute('data-acting-state'),null);
      await page.locator('.field-atlas-index a[href="#work-clearing"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/#work-clearing');
      assert.deepEqual(errors,[]);
      console.log("PASS gate",route,options);
      passed++;
    } finally { await context.close(); }
  }
  console.log('PASS gate and atlas',passed);
} finally { await browser.close(); }
