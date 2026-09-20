const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.argv[2]||'playwright');
(async()=>{
  const server=await require('./serve-public.cjs')();let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
    for(const width of [1280,844,390,320]){
      const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(server.url);await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='ready');
      await page.locator('#start').click();await page.waitForSelector('#choices button');
      await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop20-idle-${width}.png`)});
      const correct=await page.evaluate(()=>{const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);return [...document.querySelectorAll('#choices .number')].findIndex(e=>+e.textContent===a+b);});
      await page.locator('#choices button').nth((correct+1)%4).focus();await page.keyboard.down('Space');
      await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.pose==='fire');
      await page.locator('.arena').screenshot({path:path.resolve(__dirname,`../../docs/loop20-fire-${width}.png`)});
      await page.keyboard.up('Space');await page.locator('#choices button').nth(correct).focus();await page.keyboard.down('Space');
      await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');await page.keyboard.up('Space');
      await page.locator('#pause').click();await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.pose==='idle');
      assert.deepEqual(errors,[]);results.push({width,loaded:true,fire:true,score:1,pauseIdle:true,errors});
      if(width===1280){
        const imageBounds=await page.evaluate(async()=>{
          const {loadAssets}=await import('/js/render/assets.js');const {HERO_TRANSFORMS}=await import('/js/render/hero.js');
          const assets=await loadAssets();
          const c=document.createElement('canvas');c.id='qa';c.width=1200;c.height=900;c.style.position='absolute';c.style.top='0';c.style.left='0';c.style.zIndex='100';document.body.append(c);const ctx=c.getContext('2d');
          for(let row=0;row<3;row++)for(let col=0;col<2;col++){
            ctx.save();ctx.translate(col*600,row*300);ctx.fillStyle=['white','black','#bdebf5'][row];ctx.fillRect(0,0,600,300);
            ctx.translate(0,-300);ctx.scale(600/1024,600/1024);
            for(const id of [col?'armsFire':'armsIdle','heroBack']){ctx.save();ctx.transform(...HERO_TRANSFORMS[id]);ctx.drawImage(assets[id],0,0);ctx.restore();}
            ctx.restore();
          }
          const bounds=[];
          for(const id of ['heroBack','armsIdle','armsFire']){
            const sample=document.createElement('canvas');sample.width=sample.height=2048;
            const sc=sample.getContext('2d');sc.translate(512,512);sc.transform(...HERO_TRANSFORMS[id]);sc.drawImage(assets[id],0,0);
            const data=sc.getImageData(0,0,2048,2048).data;let minX=2048,minY=2048,maxX=0,maxY=0;
            for(let y=0;y<2048;y++)for(let x=0;x<2048;x++)if(data[(y*2048+x)*4+3]>8){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
            bounds.push({id,minX:minX-512,minY:minY-512,maxX:maxX-512,maxY:maxY-512});
          }
          return bounds;
        });
        for(const b of imageBounds){assert.ok(b.minX>=0 && b.maxX<1024 && b.minY>=500 && b.maxY<1030 && 400+b.maxY*496/1024<900,JSON.stringify(b));}
        fs.writeFileSync(path.resolve(__dirname,'../../docs/loop20-calibrated-bounds.json'),JSON.stringify(imageBounds,null,2)+'\n');
        await page.locator('#qa').screenshot({path:path.resolve(__dirname,'../../docs/loop20-alpha-composites.png')});
      }
      assert.deepEqual(errors,[]);await page.close();
    }
    for(const missing of ['city.webp','hero-back.png','arms-idle.png','arms-fire.png']){
      const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route(`**/${missing}`,route=>route.abort());await page.goto(server.url);
      await page.waitForFunction(()=>document.querySelector('#game-canvas').dataset.assets==='fallback');await page.locator('#start').click();
      const i=await page.evaluate(()=>{const [a,b]=document.querySelector('#problem').textContent.match(/\d+/g).map(Number);return [...document.querySelectorAll('#choices .number')].findIndex(e=>+e.textContent===a+b);});
      await page.locator('#choices button').nth(i).focus();await page.keyboard.down('Space');await page.waitForFunction(()=>document.querySelector('#score').textContent==='1');await page.keyboard.up('Space');
      if(missing==='arms-fire.png')await page.locator('.arena').screenshot({path:path.resolve(__dirname,'../../docs/loop20-fallback.png')});
      assert.deepEqual(errors,[]);results.push({missing,fallback:true,score:1,errors});await page.close();
    }
    fs.writeFileSync(path.resolve(__dirname,'../../docs/loop20-browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results);
  }finally{if(browser)await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
