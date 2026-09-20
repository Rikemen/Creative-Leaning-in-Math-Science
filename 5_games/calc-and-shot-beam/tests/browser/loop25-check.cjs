const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.argv[2]||'playwright');
(async()=>{
 const server=await require('./serve-public.cjs')();let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
  for(const width of [1280,844,390,320]){
   const page=await browser.newPage({viewport:{width,height:width===844?390:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const Native=window.Audio;window.testAudio=[];window.Audio=function(src){const a=new Native(src);testAudio.push(a);return a;};});
   await page.goto(server.url);await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
   assert.ok(await page.evaluate(()=>testAudio.every(a=>a.paused)));
   await page.locator('#level').selectOption('wide');await page.locator('#practice').click();
   await page.locator('#practice-card').focus();await page.keyboard.down('Space');await page.waitForTimeout(900);await page.keyboard.up('Space');
   assert.equal(await page.locator('#time').textContent(),'60');assert.equal(await page.locator('#score').textContent(),'0');
   assert.equal(await page.locator('#start').isEnabled(),true);
   await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop25-practice-${width}.png`)});
   await page.locator('#start').click();await page.waitForSelector('#choices button');
   const answer=await page.evaluate(()=>{const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);return [...document.querySelectorAll('#choices .number')].findIndex(e=>+e.textContent===a+b);});
   await page.locator('#choices button').nth((answer+1)%4).focus();await page.keyboard.down('Space');await page.waitForTimeout(250);
   await page.waitForFunction(()=>testAudio.some(a=>a.loop&&!a.paused));
   await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop25-fire-${width}.png`)});await page.keyboard.up('Space');
   await page.locator('#choices button').nth(answer).focus();await page.keyboard.down('Space');await page.waitForTimeout(350);
   assert.equal(await page.locator('#choices button.is-cracked').count(),1);
   await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop25-hit-${width}.png`)});
   await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');await page.keyboard.up('Space');
   await page.locator('#mute').click();assert.ok(await page.evaluate(()=>testAudio.every(a=>a.paused)));
   await page.locator('#pause').click();const time=await page.locator('#time').textContent();await page.waitForTimeout(100);assert.equal(await page.locator('#time').textContent(),time);
   assert.deepEqual(errors,[]);results.push({width,practice:true,score:1,realAudioPlayback:true,mute:true,pause:true,errors});
   await page.close();
  }
  const silent=await browser.newPage();await silent.route('**/*.wav',r=>r.abort());await silent.goto(server.url);await silent.locator('#start').click();
  const correctSilent=await silent.evaluate(()=>{const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);return [...document.querySelectorAll('#choices .number')].findIndex(e=>+e.textContent===a+b);});
  await silent.locator('#choices button').nth(correctSilent).focus();await silent.keyboard.down('Space');await silent.waitForFunction(()=>document.querySelector('#score').textContent==='1');await silent.keyboard.up('Space');await silent.close();results.push({missingAudioStillScores:true});
  const page=await browser.newPage();await page.goto(server.url);
  const audio=await page.evaluate(async()=>{const ctx=new AudioContext();const rows=[];for(const name of ['start','beam-loop','barrier','break','finish','button']){const buf=await ctx.decodeAudioData(await(await fetch(`/assets/audio/${name}-v1.wav`)).arrayBuffer());const samples=buf.getChannelData(0);let peak=0,sum=0;for(const n of samples){peak=Math.max(peak,Math.abs(n));sum+=n*n;}rows.push({name,duration:buf.duration,peak,rms:Math.sqrt(sum/samples.length),joinDifference:Math.abs(samples[0]-samples.at(-1))});}await ctx.close();return rows;});
  assert.ok(audio.every(a=>a.peak<1));fs.writeFileSync(path.resolve(__dirname,'../../docs/loop25-audio-results.json'),JSON.stringify(audio,null,2)+'\n');
  await page.clock.install();await page.goto(server.url);await page.locator('#start').click();await page.clock.fastForward(61000);await page.waitForFunction(()=>document.querySelector('#dialog-title').textContent==='おしまい！');
  await page.locator('#level').selectOption('wide');await page.locator('#start').click();assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('#time').textContent(),'60');
  results.push({resultAndReplay:true});await page.close();
  fs.writeFileSync(path.resolve(__dirname,'../../docs/loop25-browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results);
 }finally{if(browser)await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
