import test from 'node:test';import assert from 'node:assert/strict';
import {FeedbackEffects,DEBRIS_COUNT} from '../../public/js/render/feedback.js';import {createLayout} from '../../public/js/render/layout.js';
test('wrong answer only creates barrier; break emitted once, expires, and clears on pause/end',()=>{
  const fx=new FeedbackEffects(),l=createLayout(1280),s={phase:'playing',target:0,feedback:'barrier',questionId:1,choices:[1,2,3,4],problem:{answer:2}};
  assert.equal(fx.frame(s,l,0).particles.length,0);assert.ok(fx.frame(s,l,1).barrier);
  const broken={...s,phase:'breaking',feedback:'destroyed'};assert.equal(fx.frame(broken,l,10).particles.length,DEBRIS_COUNT);
  assert.equal(fx.frame(broken,l,311).particles.length,0);assert.equal(fx.frame(broken,l,312).particles.length,0);
  fx.frame({...s,phase:'paused'},l,313);assert.equal(fx.frame(broken,l,314).particles.length,0);
  for(const phase of ['paused','result'])assert.deepEqual(fx.frame({...s,phase},l,400),{barrier:null,particles:[]});
});
