import {beamPath} from './layout.js';
export const BEAM_PARTICLES=8;
export const PARTICLE_LIFETIME=400;
export function beamFrame(state,layout,now,reduced=false){
  if(state.phase!=='playing'||state.target===null)return {path:[],particles:[]};
  const path=beamPath(layout,state.target);if(!path.length)return {path,particles:[]};
  const end=path.at(-1);
  return {path,particles:reduced?[]:Array.from({length:BEAM_PARTICLES},(_,i)=>{
    const age=(now+i*50)%PARTICLE_LIFETIME,t=age/PARTICLE_LIFETIME,angle=i*Math.PI*2/BEAM_PARTICLES;
    return {x:end.x+Math.cos(angle)*t*25,y:end.y+Math.sin(angle)*t*14,alpha:1-t,age};
  })};
}
export function drawBeam(p,frame){
  if(!frame.path.length)return;
  p.noFill();
  for(const [width,color]of [[18,'#39bfea55'],[10,'#58d6ff'],[3,'#ffffff']]){
    p.stroke(color);p.strokeWeight(width);
    for(let i=1;i<frame.path.length;i++)p.line(frame.path[i-1].x,frame.path[i-1].y,frame.path[i].x,frame.path[i].y);
  }
  p.noStroke();for(const dot of frame.particles){p.fill(230,255,255,255*dot.alpha);p.circle(dot.x,dot.y,4);}
}
