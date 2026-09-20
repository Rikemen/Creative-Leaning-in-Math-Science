const {test}=require('node:test');
const assert=require('node:assert/strict');
const {api:{chromium}}=require('../browser/playwright-runtime.cjs')();
test('versioned startup bypasses the old entry and reports module failures',async()=>{
  const server=await require('../browser/serve-public.cjs')();
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage();
    await page.route(/\/js\/ui\/game\.js$/,r=>r.fulfill({contentType:'text/javascript',body:'throw Error("old entry");'}));
    await page.goto(server.url);
    await page.waitForFunction(()=>document.querySelector('.game-shell').dataset.mode==='select');
    assert.equal(await page.locator('#boot-error').isHidden(),true);
    await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError');};});
    await page.reload();await page.locator('#choose-camera').click();
    await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('許可されません'));
    await page.close();
    const broken=await browser.newPage();
    await broken.route(/\/js\/ui\/game\.js\?/,r=>r.abort());
    await broken.goto(server.url);await broken.locator('#boot-error').waitFor({state:'visible'});
    await broken.close();
  }finally{await browser.close();await server.close();}
});
