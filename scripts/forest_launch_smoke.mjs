/** Stage 18 — GitHub Pages public release verification. No screenshots or video. */
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const canonical = 'https://azrielchoerulhakim.github.io/lazarusdev/';
const ogImage = canonical + 'storybook/assets/entrance/r02/exports/entrance-desktop.webp';
const leafIcon = canonical + 'storybook/assets/entrance/exports/entrance-leaf-cue.webp';
const routes = ['/lazarusdev/', '/lazarusdev/storybook/'];
const views = [{w:320,h:720},{w:390,h:844},{w:768,h:860},{w:1440,h:900},{w:844,h:390}];
const chapters = ['entrance','winding-path','work-clearing','river-stories','house-on-the-hill'];
// Enforce the owner's standing prohibition across all current automation code.
for (const [directory,extension] of [['scripts','.mjs'],['.github/workflows','.yml']]) {
  for (const filename of await readdir(directory)) {
    if (!filename.endsWith(extension)) continue;
    const code = await readFile(directory+'/'+filename,'utf8');
    assert.equal(/\.screenshot\s*\(|\.video\s*\(|^\s*(?:path|artifact):\s*[^\n#]*screenshots\//m.test(code),false,
      'Automatic screenshot/recording code or artifact path is forbidden: '+directory+'/'+filename);
  }
}
const browser = await chromium.launch({...(process.env.CI ? {channel:'chrome'} : {}),headless:true,args:['--no-sandbox']});
let checks = 0;
try {
  const control = await browser.newContext();
  const sitemapResponse = await control.request.get(base+'/lazarusdev/sitemap.xml');
  assert.equal(sitemapResponse.status(),200,'sitemap available under project path');
  const sitemap = await sitemapResponse.text();
  assert.match(sitemap,/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,'valid sitemap namespace');
  assert.match(sitemap,/<loc>https:\/\/azrielchoerulhakim\.github\.io\/lazarusdev\/<\/loc>/,'canonical listed');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,1,'single canonical URL, no duplicates');
  for (const mediaPath of [new URL(ogImage).pathname, new URL(leafIcon).pathname]) {
    const mediaResponse=await control.request.get(base+mediaPath);
    assert.equal(mediaResponse.status(),200,'published media exists '+mediaPath);
    assert.match(mediaResponse.headers()['content-type']||'',/image\/webp/,'published image type '+mediaPath);
    assert.ok(Number(mediaResponse.headers()['content-length'])>1000,'nonempty art '+mediaPath);
  }
  await control.close();
  for (const route of routes) for (const {w,h} of views) {
    const context=await browser.newContext({viewport:{width:w,height:h}});
    const page=await context.newPage();
    const errors=[];const writes=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(!['GET','HEAD'].includes(request.method())) writes.push(request.method()+' '+request.url());});
    page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400) errors.push(response.status()+' '+response.url());});
    const tag=route+' '+w+'x'+h;
    try {
      const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
      assert.equal(response?.status(),200,tag+' HTTP status');
      await page.waitForFunction(()=>document.body.dataset.storybookReady==='true',{timeout:14000});
      const pageInfo=await page.evaluate(()=>{
        const meta=(name)=>document.querySelector('meta[name="'+name+'"]')?.getAttribute('content');
        const property=(name)=>document.querySelector('meta[property="'+name+'"]')?.getAttribute('content');
        const links=[...document.querySelectorAll('a[href^="#"]')].map(x=>x.getAttribute('href'));
        return {
          robots:meta('robots'),canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(x=>x.href),
          og:{type:property('og:type'),site:property('og:site_name'),url:property('og:url'),image:property('og:image'),alt:property('og:image:alt'),width:property('og:image:width'),height:property('og:image:height')},
          twitter:{card:meta('twitter:card'),image:meta('twitter:image'),alt:meta('twitter:image:alt')},
          icon:document.querySelector('link[rel="icon"]')?.href,
          chapters:[...document.querySelectorAll('section[data-chapter]')].map(x=>x.id),
          h1:document.querySelectorAll('h1').length,
          lang:document.documentElement.lang,
          hashLinks:links.length,
          missingAnchors:links.filter(h=>h.length>1&&!document.getElementById(h.slice(1))),
          hasAtlas:!!document.querySelector('#field-atlas'),
          conceptDisclaimer:document.querySelector('.work-clearing-afterword')?.textContent||'',
          inquiryStatus:document.querySelector('.house-status')?.textContent||'',
          copyDisclosure:document.querySelector('#house-copy-note')?.textContent||'',
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1
        };
      });
      const expectedRobots=route===routes[0]?'index,follow,max-image-preview:large':'noindex,follow';
      assert.equal(pageInfo.robots,expectedRobots,tag+' route-specific crawl policy');
      assert.deepEqual(pageInfo.canonical,[canonical],tag+' exactly one canonical');
      assert.equal(pageInfo.og.type,'website',tag+' share type');
      assert.equal(pageInfo.og.site,'Lazarus Dev',tag+' share site name');
      assert.equal(pageInfo.og.url,canonical,tag+' og:url canonical');
      assert.equal(pageInfo.og.image,ogImage,tag+' true art asset');
      assert.ok(pageInfo.og.alt.includes('illustrated forest gateway'),tag+' descriptive share alt');
      assert.deepEqual([pageInfo.og.width,pageInfo.og.height],['1536','1024'],tag+' original share dimensions');
      assert.equal(pageInfo.twitter.card,'summary_large_image',tag+' large media sharing');
      assert.equal(pageInfo.twitter.image,ogImage,tag+' social image consistent');
      assert.ok(pageInfo.twitter.alt.length>=20,tag+' meaningful twitter image description');
      assert.equal(pageInfo.icon,leafIcon,tag+' original leaf favicon');
      assert.deepEqual(pageInfo.chapters,chapters,tag+' chapter order');
      assert.equal(pageInfo.h1,1,tag+' one H1');
      assert.equal(pageInfo.lang,'en',tag+' correct language');
      assert.equal(pageInfo.hasAtlas,true,tag+' fold-out present');
      assert.ok(pageInfo.hashLinks>=15,tag+' native fragment navigation present');
      assert.deepEqual(pageInfo.missingAnchors,[],tag+' all chapter and note links must resolve');
      assert.match(pageInfo.conceptDisclaimer,/not completed commissions/,tag+' concepts remain honest');
      assert.match(pageInfo.inquiryStatus,/NOT YET CONNECTED/,tag+' no invented lead endpoint');
      assert.match(pageInfo.copyDisclosure,/Nothing is sent/,tag+' no false send claim');
      assert.equal(pageInfo.overflow,false,tag+' no horizontal overflow');
      await page.locator('a.header-quick[href="#studio-inquiry"]').count().then(n=>assert.equal(n,1,tag+' honest CTA'));
      await page.locator('#entrance a.button-primary').click();
      assert.equal(new URL(page.url()).hash,'#work-clearing',tag+' work CTA navigates');
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('[data-field-atlas] summary').count(),1,tag+' native atlas disclosure');
      assert.deepEqual(errors,[],tag+' runtime and local resource errors');
      assert.deepEqual(writes,[],tag+' no background lead submissions');
      console.log('PASS STAGE18 '+tag+' metadata, route, canonical, links and truthful inquiry');
      checks++;
    }finally{await context.close();}
  }
  for (const route of routes) {
    const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
    const page=await context.newPage();
    try {
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('h1').count(),1,route+' no-JS heading');
      assert.equal(await page.locator('#house-brief').isVisible(),true,route+' no-JS local note');
      assert.equal(await page.locator('[data-house-copy]').isVisible(),false,route+' no fake submit button');
      await page.locator('[data-field-atlas] summary').click();
      await page.locator('.field-atlas-index a[href="#river-stories"]').click();
      assert.equal(new URL(page.url()).hash,'#river-stories',route+' native atlas link works without JS');
      console.log('PASS STAGE18 no-JS '+route);
    }finally{await context.close();}
  }
  console.log('STAGE18 RELEASE PASS: '+checks+' viewport/route checks, two no-JS cases, sitemap and media verified. NO SCREENSHOTS.');
}finally{await browser.close();}
