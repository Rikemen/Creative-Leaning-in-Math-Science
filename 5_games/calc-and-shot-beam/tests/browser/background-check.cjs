// Deterministic format export and temporary composition QA; no game UI changes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.argv[2] || 'playwright');
const root = path.resolve(__dirname, '../..');
(async () => {
  const server = http.createServer((req,res) => {
    const relative = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root,'public','.'+(relative==='/' ? '/index.html' : relative));
    if (!file.startsWith(path.join(root,'public')+path.sep)) { res.writeHead(403).end(); return; }
    const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'};
    fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'Not found':data);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({channel:'chrome',headless:true});
    const page = await browser.newPage();
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    const exported = await page.evaluate(async () => {
      const img = new Image(); img.src='/assets/images/city-v1.png'; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width=1600;canvas.height=900;
      const ctx = canvas.getContext('2d',{colorSpace:'srgb'});
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      // Center crop by 0.25 source pixels vertically to preserve aspect ratio.
      const sourceHeight=img.width*900/1600;
      ctx.drawImage(img,0,(img.height-sourceHeight)/2,img.width,sourceHeight,0,0,1600,900);
      return {source:[img.width,img.height],url:canvas.toDataURL('image/webp',0.9)};
    });
    assert.deepEqual(exported.source,[1672,941]); assert.ok(exported.url.startsWith('data:image/webp;base64,'));
    const dir = path.join(root,'assets-source/images/city/v2'); fs.mkdirSync(dir,{recursive:true});
    const original = fs.readFileSync(path.join(root,'assets-source/images/city-v1.png'));
    fs.writeFileSync(path.join(dir,'original.png'),original);
    const bytes = Buffer.from(exported.url.split(',')[1],'base64');
    fs.writeFileSync(path.join(root,'public/assets/images/city.webp'),bytes);
    const qa = await page.evaluate(async()=>{
      const img=new Image();img.src='/assets/images/city.webp';await img.decode();
      const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
      const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
      const pixels=ctx.getImageData(0,0,c.width,c.height).data;
      return {width:img.width,height:img.height,opaque:pixels.every((v,i)=>i%4!==3||v===255)};
    });
    assert.deepEqual(qa,{width:1600,height:900,opaque:true});
    const screenshots=[];
    for (const width of [1280,844,390,320]) {
      await page.setViewportSize({width,height:900}); await page.goto(base);
      await page.locator('#start').click(); await page.waitForSelector('#choices button');
      // Proposed Loop 20 background/contrast layer, injected only for this QA.
      await page.addStyleTag({content:`.arena {background:#bdebf5 url('/assets/images/city.webp') center/cover no-repeat;}
        #game-canvas {visibility:hidden;} .arena::before {content:'';position:absolute;inset:0 0 auto;height:42%;background:#101c30;z-index:-1;}
        .arena[data-layout="portrait"]::before {height:30%;}`});
      await page.evaluate(async()=>{const i=new Image();i.src='/assets/images/city.webp';await i.decode();});
      const file=`docs/loop16-background-${width}.png`;
      await page.locator('.arena').screenshot({path:path.join(root,file)});screenshots.push({width,file});
    }
    const result={date:'2026-09-14',source:exported.source,...qa,bytes:bytes.length,sourceBytes:original.length,
      export:'Chrome canvas sRGB; centered 1672x940.5 crop to 1600x900; WebP quality 0.9',
      composition:'Temporary CSS injection; opaque dark panel behind HUD/equation, no character layer; not integrated',screenshots};
    fs.writeFileSync(path.join(root,'docs/loop16-background-results.json'),JSON.stringify(result,null,2)+'\n');
    const oldPrompts=JSON.parse(fs.readFileSync(path.join(root,'assets-source/prompts/imagegen-v1.json')));
    fs.writeFileSync(path.join(root,'assets-source/prompts/city-v2.json'),JSON.stringify({
      id:'city',revision:'v2',exportedAt:'2026-09-14',generatedAt:oldPrompts.createdAt,
      mode:'Existing built-in image_gen result adopted; no new generation',
      originalPrompt:oldPrompts.prompts.find(p=>p.key==='bgPrompt').prompt,
      source:'assets-source/images/city/v2/original.png',priorSource:'assets-source/images/city-v1.png',
      output:'public/assets/images/city.webp',processing:result.export,
      reproduce:'node tests/browser/background-check.cjs <Playwright module path>'
    },null,2)+'\n');
    console.log(JSON.stringify(result));
  } finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(e=>{console.error(e);process.exitCode=1;});
