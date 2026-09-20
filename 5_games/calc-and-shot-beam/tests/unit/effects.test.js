import test from 'node:test';import assert from 'node:assert/strict';
import {beamFrame,BEAM_PARTICLES,PARTICLE_LIFETIME} from '../../public/js/render/beam.js';
import {createLayout} from '../../public/js/render/layout.js';
test('beam follows origin and selected card; bounded particles disappear immediately on release',()=>{
  const l=createLayout(390),s={phase:'playing',target:0};const a=beamFrame(s,l,250);
  assert.deepEqual(a.path[0],l.emitter);assert.equal(a.particles.length,BEAM_PARTICLES);
  assert.ok(a.particles.every(p=>p.age>=0&&p.age<PARTICLE_LIFETIME));
  assert.notDeepEqual(a.path,beamFrame({...s,target:3},l,251).path);
  for(const phase of ['paused','result','breaking'])assert.deepEqual(beamFrame({...s,phase},l,252),{path:[],particles:[]});
  assert.equal(beamFrame({...s,target:null},l,252).particles.length,0);
  assert.equal(beamFrame(s,l,252,true).particles.length,0);
});
