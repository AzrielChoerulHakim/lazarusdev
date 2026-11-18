/** Walk the production scenes at real scroll positions on both public routes. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin = process.env.STORYBOOK_PREVIEW_ORIGIN || 'http://127.0.0.1:4186';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true,
  ...(process.env.CI && !process.env.CHROME_PATH ? {channel:'chrome'} : {}), args:['--no-sandbox'] });

async function place(walker, fraction) {
  await walker.evaluate((el, fraction) => {
    const box = el.parentElement.getBoundingClientRect();
    scrollTo({top:scrollY + box.top - innerHeight * .86 + fraction * (innerHeight * .54 + box.height * .56), behavior:'instant'});
  }, fraction);
  await walker.page().waitForTimeout(190);
}
try {
  for (const route of ['/lazarusdev/', '/lazarusdev/storybook/']) {
    const viewports = process.env.FOREST_ALL_VIEWPORTS
      ? [[320,720],[375,812],[390,844],[430,932],[768,860],[1024,768],[1440,900],[844,390]]
      : [[390,844],[1440,900]];
    for (const [width,height] of viewports) {
      const page = await browser.newPage({viewport:{width,height}});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + route);
      const path = page.locator('[data-walk="path"]');
      await place(path, .23);
      const start = await path.evaluate(el => el.getBoundingClientRect().x);
      await path.evaluate(el => {
        window.strideSeen = [];
        new MutationObserver(() => window.strideSeen.push(el.dataset.pose))
          .observe(el, {attributes:true, attributeFilter:['data-pose']});
      });
      for (let n = 0; n < 8; n++) {
        await page.evaluate(() => scrollBy(0, 12));
        await page.waitForTimeout(24);
      }
      assert.ok(await page.evaluate(()=>window.strideSeen.some(pose=>pose.startsWith('step-'))));
      await place(path, .45);
      assert.equal(await path.getAttribute('data-pose'), 'stand');
      assert.ok(await path.evaluate(el => el.getBoundingClientRect().x) > start);
      await place(path, .23);
      assert.ok(await path.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a < 0));
      for (const [scene, progress, pose] of [['clearing',.95,'look'],['river',.83,'reach'],['river',.97,'read'],['house',.97,'lantern']]) {
        const walker = page.locator('[data-walk="'+scene+'"]');
        await place(walker, progress);
        assert.equal(await walker.getAttribute('data-pose'), pose);
      }
      const light = page.locator('.house-glow-layer');
      assert.ok(Number(await light.evaluate(el => getComputedStyle(el).opacity)) < .5);
      await page.locator('[data-house-light-toggle]').click();
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.house-glow-layer')).opacity) > .9);
      await page.emulateMedia({reducedMotion:'reduce'});
      if (width === 390) await page.setViewportSize({width:844,height:390});
      const river = page.locator('[data-walk="river"]');
      await place(river, .25);
      const fixed = await river.evaluate(el => el.style.transform);
      await place(river, .65);
      assert.equal(await river.evaluate(el => el.style.transform), fixed);
      assert.equal(await river.getAttribute('data-pose'), 'read');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      console.log('PASS journey', route, width);
      await page.close();
    }
  }
} finally { await browser.close(); }
