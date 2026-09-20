export const SOUND_FILES={start:'start-v1',beam:'beam-loop-v2',beamFire:'beam-fire-v2',barrier:'barrier-v1',break:'break-v1',finish:'finish-v1',button:'button-v1'};
const SOUND_VOLUMES={beam:.24,beamFire:.32};
export class SoundBank{
  constructor(makeAudio=src=>new Audio(src)){
    this.enabled=false;this.muted=false;this.previous=null;this.beaming=false;this.sounds={};
    for(const [key,file]of Object.entries(SOUND_FILES)){
      try{const audio=makeAudio(`/assets/audio/${file}.wav`);audio.preload='auto';audio.volume=SOUND_VOLUMES[key]??.35;audio.loop=key==='beam';this.sounds[key]=audio;}catch{}
    }
  }
  unlock(){this.enabled=true;}
  play(key){
    if(!this.enabled||this.muted||!this.sounds[key])return;
    const a=this.sounds[key];try{
      if(key!=='beam'){a.currentTime=0;a.volume=SOUND_VOLUMES[key]??.35;}
      else{clearInterval(this.fade);a.volume=0;let step=0;this.fade=setInterval(()=>{a.volume=SOUND_VOLUMES.beam*Math.min(++step/4,1);if(step>=4)clearInterval(this.fade);},8);}
      Promise.resolve(a.play()).catch(()=>{});
    }catch{}
  }
  stopAll(){clearInterval(this.fade);for(const a of Object.values(this.sounds)){try{a.pause();a.currentTime=0;}catch{}}this.beaming=false;}
  stopBeam(){
    clearInterval(this.fade);
    const layers=['beam','beamFire'].map(key=>this.sounds[key]).filter(Boolean);
    if(!layers.length)return;
    const volumes=layers.map(a=>a.volume);let step=0;
    this.fade=setInterval(()=>{
      const factor=Math.max(1-++step/4,0);
      for(const [i,a]of layers.entries())try{a.volume=volumes[i]*factor;if(step>=4){a.pause();a.currentTime=0;}}catch{}
      if(step>=4)clearInterval(this.fade);
    },8);
  }
  setMuted(value){this.muted=Boolean(value);if(this.muted)this.stopAll();}
  update(s){
    const old=this.previous;
    if(!['playing','breaking'].includes(s.phase)&&old?.phase!==s.phase)this.stopAll();
    if(s.phase==='playing'&&(!old||['ready','result'].includes(old.phase)))this.play('start');
    if(old&&s.score>old.score)this.play('break');
    if(s.feedback==='barrier'&&s.phase==='playing'&&(old?.feedback!=='barrier'||old?.target!==s.target))this.play('barrier');
    if(s.phase==='result'&&old?.phase!=='result')this.play('finish');
    const beam=this.enabled&&!this.muted&&s.phase==='playing'&&s.target!==null;
    if(beam&&!this.beaming){clearInterval(this.fade);this.play('beamFire');this.play('beam');}
    if(!beam&&this.beaming)this.stopBeam();
    this.beaming=beam;this.previous={...s};
  }
}
