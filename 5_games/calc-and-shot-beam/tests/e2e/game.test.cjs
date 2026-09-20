const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {api:{chromium},entry}=require('../browser/playwright-runtime.cjs')();
const {audioProbe,mockBody,answerIndex,snapshot,calibrateAndStart}=require('./fixtures.cjs');
let server,browser;const results=[];
before(async()=>{server=await require('../browser/serve-public.cjs')();browser=await chromium.launch({channel:'chrome',headless:true});});
after(async()=>{
  fs.writeFileSync(path.resolve(__dirname,'../../docs/loop28-e2e-results.json'),JSON.stringify({date:new Date().toISOString(),browser:browser?.version(),runtime:entry,results},null,2)+'\n');
  await browser?.close();await server?.close();
});
const check=(name,fn)=>test(name,{timeout:60000},async()=>{
  const started=Date.now();try{await fn();results.push({name,status:'passed',elapsedMs:Date.now()-started});}
  catch(e){results.push({name,status:'failed',error:e.message});throw e;}
});
async function open({clock=false,viewport={width:1280,height:720},touch=false,init}={}){
  const page=await browser.newPage({viewport,hasTouch:touch});page.testErrors=[];page.on('pageerror',e=>page.testErrors.push(e.message));
  await page.addInitScript(audioProbe);if(init)await page.addInitScript(init);
  if(clock)await page.clock.install();await page.goto(server.url);await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');return page;
}
check('wrong → correct → release for next question → timeout → replay',async()=>{
  const page=await open({clock:true});try{
    await page.locator('#start').click();const index=await answerIndex(page);
    await page.locator('#choices button').nth((index+1)%4).focus();await page.keyboard.down('Space');await page.clock.runFor(400);
    assert.equal(await page.locator('#feedback').getAttribute('data-kind'),'barrier');assert.equal(await page.locator('#score').textContent(),'0');await page.keyboard.up('Space');
    await page.locator('#choices button').nth(index).focus();await page.keyboard.down('Space');await page.clock.runFor(1400);
    assert.equal(await page.locator('#score').textContent(),'1');await page.clock.runFor(1000);assert.equal(await page.locator('#score').textContent(),'1');
    await page.keyboard.up('Space');await page.locator('#choices button').nth(await answerIndex(page)).focus();await page.keyboard.down('Space');await page.clock.runFor(900);await page.keyboard.up('Space');assert.equal(await page.locator('#score').textContent(),'2');
    await page.clock.fastForward(61000);assert.equal(await page.locator('#dialog-title').textContent(),'おしまい！');assert.equal(await page.locator('#result-score').textContent(),'2 まい');
    await page.locator('#level').selectOption('wide');await page.locator('#start').click();assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('#time').textContent(),'60');assert.deepEqual(page.testErrors,[]);
  }finally{await page.close();}
});
check('hidden, duplicate blur, return and manual resume preserve progress and stop effects/audio',async()=>{
  const page=await open({clock:true});try{
    await page.locator('#start').click();await page.locator('#choices button').nth(await answerIndex(page)).focus();await page.keyboard.down('Space');await page.clock.runFor(200);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    const paused=await snapshot(page);assert.match(await page.locator('#dialog-description').textContent(),/画面を切り替え/);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.clock.runFor(10000);assert.deepEqual(await snapshot(page),paused);
    assert.ok(await page.evaluate(()=>testAudio.every(a=>a.paused)));
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(50);
    assert.equal(await page.locator('#overlay').isVisible(),true);assert.equal(await page.locator('#game-canvas').getAttribute('data-pose'),'idle');
    await page.keyboard.up('Space');await page.locator('#start').click();await page.clock.runFor(100);const resumed=await snapshot(page);assert.equal(resumed.problem,paused.problem);assert.deepEqual(resumed.hp,paused.hp);
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));const navigated=await snapshot(page);await page.clock.runFor(3000);assert.deepEqual(await snapshot(page),navigated);assert.match(await page.locator('#dialog-description').textContent(),/ページを離れ/);
    assert.deepEqual(page.testErrors,[]);
  }finally{await page.close();}
});
check('camera denial is explained and touch continues the same problem and HP',async()=>{
  const page=await open({init:()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError');};}});try{
    await page.locator('#start').click();await page.locator('#choices button').nth(await answerIndex(page)).focus();await page.keyboard.down('Space');await page.waitForTimeout(180);await page.keyboard.up('Space');
    await page.waitForFunction(()=>document.querySelector('#feedback').dataset.kind==='idle');
    const before=await snapshot(page);await page.locator('#change-mode').click();await page.locator('#choose-camera').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('許可されません'));
    await page.locator('#camera-touch').click();const after=await snapshot(page);assert.equal(after.problem,before.problem);assert.deepEqual(after.hp,before.hp);assert.equal(await page.locator('#overlay').isHidden(),true);assert.deepEqual(page.testErrors,[]);
  }finally{await page.close();}
});
check('required responsive sizes keep targets >=44px, numbers safe and modal buttons reachable',async()=>{
  for(const [width,height]of [[1280,720],[1024,768],[844,390],[390,844],[320,740]]){
    const page=await open({viewport:{width,height},init:()=>{Math.random=()=>.999;}});try{
      await page.locator('#level').selectOption('wide');await page.locator('#start').click();
      const layout=await page.evaluate(()=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
        return {arena:rect(document.querySelector('.arena')),cards:[...document.querySelectorAll('#choices button')].map(rect),numbers:[...document.querySelectorAll('#choices .number')].map(rect),pause:rect(document.querySelector('#pause')),track:rect(document.querySelector('.time-track')),overflow:document.documentElement.scrollWidth>innerWidth};
      });
      assert.equal(layout.overflow,false);assert.ok(layout.pause.width>=44&&layout.pause.height>=44);assert.ok(layout.pause.bottom<=layout.track.y);
      layout.cards.forEach((c,i)=>{assert.ok(c.width>=44&&c.height>=44);const n=layout.numbers[i];assert.ok(n.x>=c.x&&n.y>=c.y&&n.right<=c.right&&n.bottom<=c.bottom);for(const other of layout.cards.slice(i+1))assert.ok(c.right<=other.x||other.right<=c.x||c.bottom<=other.y||other.bottom<=c.y);});
      await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop27-${width}.png`)});
      await page.locator('#pause').click();await page.locator('#start').scrollIntoViewIfNeeded();assert.equal(await page.locator('#start').isVisible(),true);
      await page.locator('#start').click();assert.deepEqual(page.testErrors,[]);
    }finally{await page.close();}
  }
});
check('touch hold scores on a narrow screen and resize preserves progress',async()=>{
  const page=await open({viewport:{width:390,height:844},touch:true});try{
    await page.locator('#start').click();const card=page.locator('#choices button').nth(await answerIndex(page));await card.scrollIntoViewIfNeeded();const b=await card.boundingBox();
    const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
    await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(400);await page.locator('#pause').click();const paused=await snapshot(page);await page.setViewportSize({width:844,height:390});assert.deepEqual(await snapshot(page),paused);await page.locator('#start').click();assert.equal(await page.locator('#score').textContent(),'1');assert.deepEqual(page.testErrors,[]);
  }finally{await page.close();}
});
check('mock shoulder recognition loss pauses, shoulder recovery resumes, camera stop disarms',async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
    await mockBody(page);await page.goto(server.url);await page.locator('#choose-camera').click();await calibrateAndStart(page);
    const index=await answerIndex(page);await page.evaluate(offset=>{poseOffset=offset;},[200,50,-50,-200][index]);await page.waitForFunction(i=>document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'),index);
    await page.evaluate(()=>{poseMissing=true;});await page.waitForFunction(()=>document.querySelector('#feedback').dataset.tracking==='waiting');const paused=await snapshot(page);await page.waitForTimeout(500);assert.deepEqual(await snapshot(page),paused);
    assert.equal(await page.locator('#overlay').isHidden(),true);assert.equal(await page.locator('.arena').isVisible(),true);
    await page.evaluate(()=>{poseMissing=false;wristsNear=false;});await page.waitForFunction(()=>document.querySelector('#feedback').dataset.tracking==='tracking');assert.equal(await page.locator('#score').textContent(),'0');
    await page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(()=>{wristsNear=true;});await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');await page.locator('#change-mode').click();assert.equal(await page.locator('#overlay').isVisible(),true);
    assert.ok(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')));assert.deepEqual(errors,[]);
  }finally{await page.close();}
});

test('two entries share artwork; camera replay keeps camera mode', {timeout:90000},async()=>{
  const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await mockBody(page);await page.goto(server.url);
    for(const [width,height] of [[1280,900],[844,390],[390,844]]){
      await page.setViewportSize({width,height});
      assert.equal(await page.locator('#camera-setup').isHidden(),true);
      await page.locator('#choose-camera').scrollIntoViewIfNeeded();assert.equal(await page.locator('#choose-camera').isVisible(),true);
      await page.locator('#start').scrollIntoViewIfNeeded();assert.equal(await page.locator('#start').isVisible(),true);
      await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/modes-entry-${width}.png`)});
    }
    await page.setViewportSize({width:1280,height:900});await page.locator('#choose-camera').click();
    await page.waitForFunction(()=>!document.querySelector('#aim-calibrate').disabled);
    assert.equal(await page.locator('.arena').isHidden(),true);
    await calibrateAndStart(page);
    assert.equal(await page.locator('#camera-setup').isHidden(),true);
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
    const correct=await answerIndex(page);
    await page.evaluate(offset=>{poseOffset=offset;},[200,50,-50,-200][correct]);
    await page.waitForFunction(i=>document.querySelectorAll('#choices button')[i].classList.contains('is-aimed'),correct);
    await page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('左右にねらって'));
    await page.evaluate(()=>{wristsNear=true;});
    await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.pose==='fire');
    await page.locator('.arena').screenshot({path:path.resolve(__dirname,'../../docs/modes-camera-fire.png')});
    await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');
    await page.waitForFunction(()=>document.querySelector('#dialog-title').textContent==='おしまい！',null,{timeout:65000});
    assert.match(await page.locator('#start').textContent(),/カメラでもういちど/);
    assert.ok(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')));
    await page.locator('#start').click();await page.waitForFunction(()=>!document.querySelector('#aim-calibrate').disabled);
    await page.evaluate(()=>{wristsNear=false;});await calibrateAndStart(page);
    assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('.game-shell').getAttribute('data-mode'),'camera');
    await page.locator('#change-mode').click();const paused=await snapshot(page);await page.locator('#start').click();
    assert.equal(await page.locator('.game-shell').getAttribute('data-mode'),'mouse');assert.equal((await snapshot(page)).problem,paused.problem);
    assert.ok(await page.evaluate(()=>testStream.getTracks().every(t=>t.readyState==='ended')));assert.deepEqual(errors,[]);
  }finally{await page.close();}
});
