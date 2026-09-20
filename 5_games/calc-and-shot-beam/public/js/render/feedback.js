export const DEBRIS_COUNT=6;
export const DEBRIS_MS=300;
export class FeedbackEffects{
  constructor(){this.lastQuestion=null;this.debris=null;}
  update(state,now){
    if(!['playing','breaking'].includes(state.phase)){this.debris=null;if(state.phase!=='paused')this.lastQuestion=null;return;}
    if(state.phase==='playing'&&state.questionId!==this.lastQuestion)this.debris=null;
    if(state.phase==='breaking'&&this.lastQuestion!==state.questionId){
      this.lastQuestion=state.questionId;this.debris={index:state.choices.indexOf(state.problem.answer),started:now};
    }
    if(this.debris&&now-this.debris.started>=DEBRIS_MS)this.debris=null;
  }
  frame(state,layout,now,reduced=false){
    this.update(state,now);
    const barrier=state.phase==='playing'&&state.feedback==='barrier'?layout.cards[state.target]:null;
    const card=this.debris&&layout.cards[this.debris.index];
    const t=this.debris?(now-this.debris.started)/DEBRIS_MS:0;
    return {barrier,particles:card&&!reduced?Array.from({length:DEBRIS_COUNT},(_,i)=>({
      x:card.x+card.width/2+(i-2.5)*12*(1+t),y:card.y+card.height+12+45*t*t,size:8*(1-t)
    })):[]};
  }
}
export function drawFeedback(p,frame){
  if(frame.barrier){const c=frame.barrier;p.noFill();p.stroke('#9e79e8');p.strokeWeight(5);p.arc(c.x+c.width/2,c.y+c.height+10,c.width*.65,35,0,Math.PI);}
  p.noStroke();p.fill('#f7f3e9');for(const d of frame.particles)p.rect(d.x,d.y,d.size,d.size);
}
