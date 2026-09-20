const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.argv[2] || 'playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const [width, height] of [[1280,720],[1024,768],[844,390],[740,900],[390,844],[320,740]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:5100/');
      await page.locator('#start').click();
      await page.waitForSelector('#choices button');
      await page.waitForTimeout(250);
      const geometry = await page.evaluate(async () => {
        const { createLayout } = await import('/js/render/layout.js');
        const arena = document.querySelector('.arena'), a = arena.getBoundingClientRect();
        const layout = createLayout(arena.clientWidth);
        const box = e => { const r = e.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; };
        return { arena:box(arena), cards:[...document.querySelectorAll('#choices button')].map(box),
          numbers:[...document.querySelectorAll('#choices .number')].map(box),
          expected:layout.cards.map(c => ({ x:a.x+1+c.x*layout.scale, y:a.y+1+c.y*layout.scale, width:c.width*layout.scale, height:c.height*layout.scale })),
          safe:layout.numbers.map(c => ({ x:a.x+1+c.x*layout.scale, y:a.y+1+c.y*layout.scale, width:c.width*layout.scale, height:c.height*layout.scale })),
          canvas:box(document.querySelector('#game-canvas canvas')), overflow:document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(geometry.overflow, false);
      geometry.cards.forEach((c,i) => {
        for (const key of ['x','y','width','height']) assert.ok(Math.abs(c[key]-geometry.expected[i][key]) < 1, `${width}: card ${i} ${key}`);
        assert.ok(c.width>=44 && c.height>=44);
        const n = geometry.numbers[i]; assert.ok(n.x>=c.x && n.y>=c.y && n.x+n.width<=c.x+c.width && n.y+n.height<=c.y+c.height);
        const safe = geometry.safe[i]; assert.ok(n.x>=safe.x && n.y>=safe.y && n.x+n.width<=safe.x+safe.width && n.y+n.height<=safe.y+safe.height, `${width}: numeric safety region`);
      });
      assert.ok(Math.abs(geometry.canvas.width-(geometry.arena.width-2))<1);
      const answer = await page.evaluate(() => {
        const [a,b] = document.querySelector('#problem').textContent.match(/\d+/g).map(Number);
        return [...document.querySelectorAll('#choices .number')].findIndex(e=>Number(e.textContent)===a+b);
      });
      await page.locator('#choices button').nth((answer+1)%4).focus(); await page.keyboard.down('Space');
      await page.waitForFunction(()=>document.querySelector('#feedback').dataset.kind==='barrier');
      await page.locator('.arena').screenshot({ path:path.resolve(__dirname,`../../docs/loop14-layout-${width}.png`) });
      await page.keyboard.up('Space');
      await page.locator('#choices button').nth(answer).focus(); await page.keyboard.down('Space');
      await page.waitForFunction(()=>document.querySelector('#score').textContent==='1'); await page.keyboard.up('Space');
      await page.locator('#pause').click();
      const contained = await page.evaluate(() => {
        const a=document.querySelector('.arena').getBoundingClientRect(), d=document.querySelector('.dialog').getBoundingClientRect();
        return d.x>=a.x && d.y>=a.y && d.right<=a.right && d.bottom<=a.bottom;
      });
      assert.ok(contained, `${width}: pause dialog containment`); assert.deepEqual(errors, []);
      if (width === 1280) {
        await page.setViewportSize({width:390,height:844});
        await page.waitForFunction(()=>document.querySelector('.arena').dataset.layout==='portrait');
        await page.locator('#start').click();
        await page.waitForTimeout(450);
        const correct = await page.evaluate(() => {
          const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);
          return [...document.querySelectorAll('#choices .number')].findIndex(e=>Number(e.textContent)===a+b);
        });
        await page.locator('#choices button').nth(correct).scrollIntoViewIfNeeded();
        const c=await page.locator('#choices button').nth(correct).boundingBox();
        await page.mouse.move(c.x+c.width/2,c.y+c.height/2); await page.mouse.down();
        await page.waitForFunction(()=>document.querySelector('#score').textContent==='2'); await page.mouse.up();
      }
      results.push({ width,height, cards:'aligned', numbers:'contained', barrier:'passed', scoring:'passed', pause:'contained', resizePointerScoring:width===1280 ? 'passed' : 'not run', errors });
      await page.close();
    }
    fs.writeFileSync(path.resolve(__dirname,'../../docs/loop14-browser-results.json'),JSON.stringify(results,null,2)+'\n');
    console.log(JSON.stringify(results));
  } finally { await browser.close(); }
})().catch(e=>{ console.error(e); process.exitCode=1; });
