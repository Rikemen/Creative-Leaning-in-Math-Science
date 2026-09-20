// Source landmarks measured in the retained 1254px originals. Each image is
// exported to 1024px without cropping; this calibration aligns all layers.
export const HERO_ANCHORS = Object.freeze({
  shoulderLeft: [230, 930], shoulderRight: [794, 930], beamOrigin: [512, 768],
});
export const SOURCE_ANCHORS = Object.freeze({
  heroBack: [[280, 1175], [975, 1175], [627, 660]],
  armsIdle: [[70, 1060], [1180, 1060], [627, 300]],
  armsFire: [[70, 1060], [1160, 1150], [930, 490]],
});

export function affine(source, target) {
  const [[x0,y0],[x1,y1],[x2,y2]] = source;
  const det = (x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);
  if (!Number.isFinite(det) || Math.abs(det)<1e-8) throw new RangeError('Degenerate landmarks');
  const solve = axis => {
    const v1=target[1][axis]-target[0][axis],v2=target[2][axis]-target[0][axis];
    const a=(v1*(y2-y0)-v2*(y1-y0))/det;
    const b=((x1-x0)*v2-(x2-x0)*v1)/det;
    return [a,b,target[0][axis]-a*x0-b*y0];
  };
  const [a,c,e]=solve(0),[b,d,f]=solve(1);
  return [a,b,c,d,e,f];
}

export const HERO_TRANSFORMS = Object.freeze(Object.fromEntries(Object.entries(SOURCE_ANCHORS).map(([id, points]) => {
  // Keep the source proportions for the torso and resting arms. Compressing a
  // third landmark vertically made the helmet and shoulders look flattened.
  const scale=(HERO_ANCHORS.shoulderRight[0]-HERO_ANCHORS.shoulderLeft[0])/(points[1][0]-points[0][0]);
  const third=id==='armsFire' ? HERO_ANCHORS.beamOrigin : [
    HERO_ANCHORS.shoulderLeft[0]+(points[2][0]-points[0][0])*scale,
    HERO_ANCHORS.shoulderLeft[1]+(points[2][1]-points[0][1])*scale,
  ];
  return [id,affine(points.map(p=>p.map(v=>v*1024/1254)),
    [HERO_ANCHORS.shoulderLeft,HERO_ANCHORS.shoulderRight,third])];
})));

export function drawHero(p, layout, assets, firing) {
  const ids=[firing ? 'armsFire' : 'armsIdle', 'heroBack'];
  // Use the entire placeholder if any character layer is missing, avoiding a
  // disconnected mixture of a bitmap torso and placeholder arms.
  if (!assets.heroBack || !assets.armsIdle || !assets.armsFire) return false;
  const frame=layout.avatar, ctx=p.drawingContext;
  ctx.save(); ctx.translate(frame.x,frame.y); ctx.scale(frame.width/1024,frame.height/1024);
  for (const id of ids) {
    ctx.save(); ctx.transform(...HERO_TRANSFORMS[id]); ctx.drawImage(assets[id],0,0); ctx.restore();
  }
  ctx.restore(); return true;
}
