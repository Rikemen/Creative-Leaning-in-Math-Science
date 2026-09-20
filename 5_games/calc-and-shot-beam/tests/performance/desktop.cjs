// Real elapsed time: no fake clock or synthetic camera. Measures the installed
// desktop Chrome's keyboard/touch-fallback path, not body recognition latency.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const {api:{chromium},entry}=require('../browser/playwright-runtime.cjs')();
const {answerIndex}=require('../e2e/fixtures.cjs');
const quantile=(values,q)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.min(sorted.length-1,Math.floor(q*sorted.length))]:null;};
(async()=>{
  const server=await require('../browser/serve-public.cjs')();let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      window.perfProbe={recording:false,frames:[],latencies:[],pending:null,audio:[]};
      const Native=window.Audio;window.Audio=function(src){const a=new Native(src);perfProbe.audio.push(a);return a;};
      const clear=CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect=function(...args){
        if(perfProbe.recording&&this.canvas.parentElement?.id==='game-canvas')perfProbe.frames.push(performance.now());
        return clear.apply(this,args);
      };
      document.addEventListener('keydown',e=>{if(e.key===' '&&e.target.closest('[data-choice]')&&perfProbe.recording)perfProbe.pending=performance.now();},{capture:true});
      document.addEventListener('DOMContentLoaded',()=>{
        new MutationObserver(()=>{
          if(perfProbe.pending!==null&&['hit','barrier'].includes(document.querySelector('#feedback').dataset.kind)){
            perfProbe.latencies.push(performance.now()-perfProbe.pending);perfProbe.pending=null;
          }
        }).observe(document.querySelector('#feedback'),{attributes:true,childList:true,subtree:true});
      });
    });
    await page.goto(server.url);await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
    const cold=await page.evaluate(()=>({assetsReadyMs:performance.now(),domContentLoadedMs:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
      resources:performance.getEntriesByType('resource').map(r=>({path:new URL(r.name).pathname,durationMs:r.duration,transferBytes:r.transferSize})),heapBytes:performance.memory?.usedJSHeapSize??null}));
    const report={date:new Date().toISOString(),condition:'installed desktop Chrome headless; 1280x720; real wall-clock; keyboard fallback; sound enabled',
      browser:browser.version(),runtime:entry,hardware:{platform:os.platform(),release:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,memoryBytes:os.totalmem()},
      camera:'Not exercised: physical camera/body-recognition latency remains unverified',ipadSafari:'Not available in this environment',cold,rounds:[]};
    console.log(JSON.stringify({event:'cold-load',assetsReadyMs:cold.assetsReadyMs,browser:report.browser}));
    for(let round=1;round<=3;round++){
      await page.locator('#start').click();await page.locator('.arena').scrollIntoViewIfNeeded();
      await page.evaluate(()=>{Object.assign(perfProbe,{recording:true,frames:[],latencies:[],pending:null,started:performance.now()});});
      let plays=0;
      while(await page.locator('#overlay').isHidden()){
        const index=await answerIndex(page);const score=Number(await page.locator('#score').textContent());
        await page.locator('#choices button').nth(index).focus();await page.keyboard.down('Space');
        await page.waitForFunction(n=>Number(document.querySelector('#score').textContent)>n||!document.querySelector('#overlay').hidden,score,{timeout:6000});
        await page.keyboard.up('Space');plays++;
        if(await page.locator('#overlay').isVisible())break;
        await page.waitForFunction(()=>!document.querySelectorAll('#choices button')[0].disabled||!document.querySelector('#overlay').hidden);
      }
      const raw=await page.evaluate(()=>{
        perfProbe.recording=false;return {elapsedMs:performance.now()-perfProbe.started,frames:perfProbe.frames,latencies:perfProbe.latencies,
          score:Number(document.querySelector('#score').textContent),time:document.querySelector('#time').textContent,
          beamStopped:perfProbe.audio.filter(a=>a.loop).every(a=>a.paused),heapBytes:performance.memory?.usedJSHeapSize??null};
      });
      const intervals=raw.frames.slice(1).map((t,i)=>t-raw.frames[i]);
      const {frames,latencies,...summary}=raw;
      const result={round,...summary,plays,draws:frames.length,averageDrawFps:frames.length/(raw.elapsedMs/1000),
        frameIntervalP50Ms:quantile(intervals,.5),frameIntervalP95Ms:quantile(intervals,.95),frameIntervalMaxMs:Math.max(...intervals),
        keyboardToFeedbackP50Ms:quantile(latencies,.5),keyboardToFeedbackP95Ms:quantile(latencies,.95),responseSamples:latencies.length};
      assert.equal(raw.time,'0');assert.ok(raw.elapsedMs>=58000&&raw.elapsedMs<70000);assert.ok(raw.score>0);assert.ok(raw.beamStopped);assert.deepEqual(errors,[]);
      report.rounds.push(result);console.log(JSON.stringify({event:'round-complete',...result}));
      await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop29-round-${round}.png`)});
      report.errors=errors;fs.writeFileSync(path.resolve(__dirname,'../../docs/loop29-performance.json'),JSON.stringify(report,null,2)+'\n');
    }
  }finally{if(browser)await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
