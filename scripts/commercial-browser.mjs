import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4186/lazarusdev/';
mkdirSync('artifacts/commercial',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
try {
 for(const [width,height] of [[320,720],[390,844],[768,1024],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(origin);assert.equal(response.status(),200);
  await page.locator('#hero-title').waitFor();
  assert.equal(await page.locator('[data-addon]').count(),10);
  assert.equal(await page.locator('.steps li').count(),7);
  assert.equal(await page.locator('.terms details').count(),12);
  await page.locator('.hero-art img').evaluate(img=>img.decode());
  assert.ok(await page.locator('.hero-art img').evaluate(i=>i.naturalWidth>0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
  await page.screenshot({path:'artifacts/commercial/'+width+'-hero.png'});
  await page.locator('#addon-0').fill('2');
  await page.locator('#addon-1').fill('1');
  await page.locator('#addon-2').check();
  assert.match(await page.locator('#total').innerText(),/1[.]149[.]000/);
  assert.match(await page.locator('#dp').innerText(),/574[.]500/);
  await page.locator('.estimate [data-plan]').click();
  assert.match(await page.locator('#order-output').inputValue(),/Business \/ UMKM/);
  assert.match(await page.locator('#order-output').inputValue(),/1[.]149[.]000/);
  const contact=new URL(await page.locator('#whatsapp-order').getAttribute('href'));
  assert.equal(contact.origin,'https://wa.me');
  assert.equal(contact.pathname,'/6285111507037');
  assert.match(contact.searchParams.get('text'),/1[.]149[.]000/);
  assert.equal(await page.locator('.footer-social a').count(),3);
  await page.locator('#ketentuan details').last().locator('summary').click();
  assert.equal(await page.locator('#ketentuan details').last().getAttribute('open'),'');
  await page.locator('#personal').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/commercial/'+width+'-pricing.png'});
  assert.deepEqual(errors,[]);
  await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto(origin);assert.equal(await nojs.locator('.steps li').count(),7);assert.equal(await nojs.locator('.terms details').count(),12);await nojs.close();
 console.log('Commercial browser QA passed');
}finally{await browser.close();}
