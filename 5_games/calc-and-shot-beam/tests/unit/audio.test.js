import test from 'node:test';import assert from 'node:assert/strict';import {SoundBank} from '../../public/js/audio/sound.js';
test('no sound before gesture, reusable looping source, mute/pause stops and finish survives next frame',()=>{
  const elements=[];const bank=new SoundBank(src=>{const a={src,plays:0,stops:0,play(){this.plays++;return Promise.resolve();},pause(){this.stops++;}};elements.push(a);return a;});
  const s={phase:'playing',score:0,feedback:'hit',target:0};bank.update(s);assert.ok(elements.every(a=>a.plays===0));
  bank.unlock();bank.update(s);bank.update(s);assert.equal(bank.sounds.beam.plays,1);
  bank.setMuted(true);bank.update(s);assert.equal(bank.beaming,false);
  bank.setMuted(false);bank.update(s);assert.equal(bank.sounds.beam.plays,2);
  bank.update({...s,phase:'paused',target:null});assert.equal(bank.beaming,false);
  bank.update({...s,phase:'result',target:null});const stops=bank.sounds.finish.stops;
  bank.update({...s,phase:'result',target:null});assert.equal(bank.sounds.finish.plays,1);assert.equal(bank.sounds.finish.stops,stops);
  bank.update({...s,target:null});assert.equal(elements.length,7);
});
test('missing/blocked audio cannot throw into gameplay',async()=>{
  const bank=new SoundBank(()=>({pause(){throw Error();},play(){return Promise.reject(Error('blocked'));}}));bank.unlock();bank.play('start');bank.stopAll();await Promise.resolve();
  assert.doesNotThrow(()=>new SoundBank(()=>{throw Error();}).update({phase:'ready'}));
});

function soundFixture(){
  const bank=new SoundBank(src=>({src,paused:true,plays:0,currentTime:0,
    play(){this.paused=false;this.plays++;return Promise.resolve();},pause(){this.paused=true;}}));
  bank.unlock();return bank;
}
const firing={phase:'playing',score:0,feedback:'hit',target:0};

test('launch sounds once per beam, target movement does not retrigger, release fades both layers',t=>{
  t.mock.timers.enable({apis:['setInterval']});
  const bank=soundFixture();bank.update(firing);t.mock.timers.tick(40);
  assert.equal(bank.sounds.beamFire.loop,false);assert.equal(bank.sounds.beam.loop,true);
  for(let i=0;i<60;i++)bank.update({...firing,target:i%4});
  assert.equal(bank.sounds.beamFire.plays,1);assert.equal(bank.sounds.beam.plays,1);
  assert.equal(bank.sounds.beamFire.paused,false);
  bank.update({...firing,target:null});t.mock.timers.tick(40);
  for(const key of ['beam','beamFire']){assert.equal(bank.sounds[key].paused,true);assert.equal(bank.sounds[key].currentTime,0);}
  bank.update(firing);t.mock.timers.tick(40);
  assert.equal(bank.sounds.beamFire.plays,2);assert.ok(bank.sounds.beamFire.volume>0);
  assert.equal(bank.sounds.beamFire.paused,false);bank.stopAll();
});

test('quick refire cancels old fades; mute and pause stop launch and sustain immediately',t=>{
  t.mock.timers.enable({apis:['setInterval']});
  const bank=soundFixture();bank.update(firing);t.mock.timers.tick(40);
  bank.update({...firing,target:null});t.mock.timers.tick(8);bank.update(firing);t.mock.timers.tick(40);
  assert.equal(bank.sounds.beamFire.paused,false);assert.equal(bank.sounds.beam.paused,false);
  bank.setMuted(true);t.mock.timers.tick(100);
  assert.ok(Object.values(bank.sounds).every(a=>a.paused));
  bank.setMuted(false);bank.update(firing);bank.update({...firing,phase:'paused',target:null});t.mock.timers.tick(100);
  assert.ok(Object.values(bank.sounds).every(a=>a.paused));
});
