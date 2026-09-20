import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ASSET_MANIFEST,createAssetLoader} from '../../public/js/render/assets.js';
import {HERO_ANCHORS,HERO_TRANSFORMS,SOURCE_ANCHORS,affine,drawHero} from '../../public/js/render/hero.js';
import {createLayout} from '../../public/js/render/layout.js';

test('every required asset exists with its declared dimensions',()=>{
  for(const spec of Object.values(ASSET_MANIFEST)){
    const data=readFileSync(new URL('../../public'+spec.src,import.meta.url));
    if(spec.src.endsWith('.png')){
      assert.equal(data.readUInt32BE(16),spec.width);assert.equal(data.readUInt32BE(20),spec.height);
      assert.equal(data[25],6,'RGBA PNG');
    }else{assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');}
  }
});
test('loader shares one pending request and never reloads settled images',async()=>{
  const images=[];const load=createAssetLoader(()=>{const i={};images.push(i);return i;});
  const a=load(),b=load();assert.equal(a,b);assert.equal(images.length,4);
  images.forEach((i,n)=>{const spec=Object.values(ASSET_MANIFEST)[n];i.naturalWidth=spec.width;i.naturalHeight=spec.height;i.onload();});
  const assets=await a;assert.equal(assets.armsFire,images[3]);assert.equal(load(),a);assert.equal(images.length,4);
});
test('load errors, invalid dimensions, thrown creation and stalled fetches settle safely',async()=>{
  const images=[];const load=createAssetLoader(()=>{const i={};images.push(i);return i;},10);
  const promise=load();images[0].onerror();images[1].naturalWidth=0;images[1].onload();
  const result=await promise;assert.ok(Object.values(result).every(v=>v===null));
  const failed=await createAssetLoader(()=>{throw new Error('unavailable');})();
  assert.ok(Object.values(failed).every(v=>v===null));assert.equal(images[2].onload,null);
});
test('calibration joins both shoulders in both poses and beam to the shared emitter',()=>{
  for(const id of ['heroBack','armsIdle']){
    const [a,b,c,d]=HERO_TRANSFORMS[id];
    assert.ok(Math.abs(a-d)<1e-8,'preserve the original aspect ratio');
    assert.ok(Math.abs(b)<1e-8&&Math.abs(c)<1e-8,'do not shear the resting figure');
  }
  const transform=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
  const near=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-8));
  for(const [id,points]of Object.entries(SOURCE_ANCHORS)){
    const normalized=points.map(p=>p.map(v=>v*1024/1254));
    near(transform(HERO_TRANSFORMS[id],normalized[0]),HERO_ANCHORS.shoulderLeft);
    near(transform(HERO_TRANSFORMS[id],normalized[1]),HERO_ANCHORS.shoulderRight);
    if(id==='armsFire')near(transform(HERO_TRANSFORMS[id],normalized[2]),HERO_ANCHORS.beamOrigin);
  }
  for(const width of [320,390,844,1280]){
    const l=createLayout(width),f=l.avatar;
    near([f.x+512*f.width/1024,f.y+768*f.height/1024],[l.emitter.x,l.emitter.y]);
  }
  assert.throws(()=>affine([[0,0],[0,0],[0,0]],[[0,0],[1,1],[2,2]]));
});
test('missing character layer selects whole placeholder; complete set switches only arms',()=>{
  assert.equal(drawHero({},createLayout(1280),{},false),false);
  const drawn=[];const ctx={save(){},restore(){},translate(){},scale(){},transform(){},drawImage(image){drawn.push(image);}};
  const assets={heroBack:'head',armsIdle:'idle',armsFire:'fire'};
  assert.equal(drawHero({drawingContext:ctx},createLayout(1280),assets,false),true);
  assert.deepEqual(drawn,['idle','head']);drawn.length=0;
  drawHero({drawingContext:ctx},createLayout(1280),assets,true);assert.deepEqual(drawn,['fire','head']);
});
