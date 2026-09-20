const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.argv[2]||'playwright');
const root=path.resolve(__dirname,'../..');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage(); const results=[];
    for (const id of ['hero-back','arms-idle','arms-fire']) {
      const source=path.join(root,`assets-source/images/${id}/v2/original.png`);
      const data='data:image/png;base64,'+fs.readFileSync(source).toString('base64');
      const result=await page.evaluate(async src=>{
        const i=new Image();i.src=src;await i.decode();
        const c=document.createElement('canvas');c.width=c.height=1024;
        const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(i,0,0,1024,1024);
        const pixels=ctx.getImageData(0,0,1024,1024).data;let transparent=0,opaque=0;
        for(let n=3;n<pixels.length;n+=4){if(pixels[n]===0)transparent++;if(pixels[n]>=250)opaque++;}
        return {source:[i.width,i.height],transparent,opaque,opaqueThreshold:250,url:c.toDataURL('image/png')};
      },data);
      console.log(id,{transparent:result.transparent,opaque:result.opaque});
      assert.deepEqual(result.source,[1254,1254]);assert.ok(result.transparent>100000 && result.opaque>10000);
      fs.writeFileSync(path.join(root,`public/assets/images/${id}.png`),Buffer.from(result.url.split(',')[1],'base64'));
      delete result.url;results.push({id,...result,width:1024,height:1024});
    }
    fs.writeFileSync(path.join(root,'docs/loop20-image-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
