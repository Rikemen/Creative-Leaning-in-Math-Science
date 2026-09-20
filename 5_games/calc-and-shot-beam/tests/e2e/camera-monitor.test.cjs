const {test}=require('node:test');
const assert=require('node:assert/strict'),path=require('node:path');
const {api:{chromium}}=require('../browser/playwright-runtime.cjs')();
const {mockBody,answerIndex,calibrateAndStart}=require('./fixtures.cjs');
test('camera monitor hides independently while body input keeps scoring',async()=>{
  const server=await require('../browser/serve-public.cjs')();
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await mockBody(page);await page.goto(server.url);await page.evaluate(()=>{elbowsMissing=true;});await page.locator('#choose-camera').click();
    await page.waitForFunction(()=>!document.querySelector('#aim-calibrate').disabled);
    assert.equal(await page.locator('.arena').isHidden(),true);
    assert.equal(await page.locator('#choices button').count(),0);
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
    await page.locator('#camera-setup').screenshot({path:path.resolve(__dirname,'../../docs/camera-unified-ready.png')});
    assert.ok(await page.locator('#camera-pose circle').count()>0);
    assert.equal(await page.locator('#camera-pose [data-wrist-gap]').count(),1);
    assert.equal(await page.locator('#camera-pose [data-joint=left_elbow]').count(),0);
    await calibrateAndStart(page);
    assert.equal(await page.locator('#camera-monitor').isHidden(),true);
    assert.equal(await page.locator('#camera-view').isHidden(),true);
    assert.equal(await page.locator('#toggle-camera-preview').getAttribute('aria-expanded'),'false');
    await page.locator('#toggle-camera-preview').click();
    assert.equal(await page.locator('#camera-view').isVisible(),true);
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
    for(const [width,height] of [[1280,900],[844,390],[390,844]]){
      await page.setViewportSize({width,height});
      const monitor=await page.locator('#camera-monitor').boundingBox(),arena=await page.locator('.arena').boundingBox();
      assert.ok(monitor.x>=arena.x);
      assert.ok(monitor.x>=arena.x+arena.width-1||monitor.y+monitor.height<=arena.y+1);
      await page.locator('.play-stage').screenshot({path:path.resolve(__dirname,`../../docs/camera-monitor-${width}.png`)});
    }
    await page.locator('#toggle-camera-preview').click();
    assert.equal(await page.locator('#camera-view').isVisible(),false);
    assert.equal(await page.locator('#toggle-camera-preview').getAttribute('aria-expanded'),'false');
    assert.ok(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='live')));
    const index=await answerIndex(page);await page.evaluate(offset=>{poseOffset=offset;},[200,50,-50,-200][index]);
    await page.waitForFunction(i=>document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'),index);
    await page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(()=>{wristsNear=true;});
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.pose==='fire');
    await page.locator('.play-stage').screenshot({path:path.resolve(__dirname,'../../docs/camera-unified-fire.png')});
    await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');
    await page.locator('#toggle-camera-preview').click();assert.equal(await page.locator('#camera-view').isVisible(),true);
    await page.locator('#change-mode').click();assert.equal(await page.locator('#camera-monitor').isHidden(),true);
    assert.ok(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')));assert.deepEqual(errors,[]);
  }finally{await browser.close();await server.close();}
});
