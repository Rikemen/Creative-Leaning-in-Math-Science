import {beamFrame,drawBeam} from './beam.js';
import {FeedbackEffects,drawFeedback} from './feedback.js';
import { loadAssets } from './assets.js';
import { drawHero } from './hero.js?v=20260914-proportion';

/** Bitmap layers with non-blocking loading and code-drawn fallback. */
export function mountSketch(host, getState, getLayout) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let assets = {}, removed = false;
  const effects=new FeedbackEffects();
  loadAssets().then(value => {
    if (removed) return;
    assets=value;
    host.dataset.assets=Object.values(value).every(Boolean) ? 'ready' : 'fallback';
  });
  return new window.p5(p => {
    let observer;
    p.setup = () => {
      p.createCanvas(host.clientWidth, host.clientHeight);
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.frameRate(30);
      observer = new ResizeObserver(() => p.resizeCanvas(host.clientWidth, host.clientHeight));
      observer.observe(host);
    };
    p.draw = () => {
      p.clear();
      if (assets.city) {
        const scale=Math.max(p.width/assets.city.width,p.height/assets.city.height);
        const w=assets.city.width*scale,h=assets.city.height*scale;
        p.drawingContext.drawImage(assets.city,(p.width-w)/2,(p.height-h)/2,w,h);
      } else {
      p.stroke(80, 130, 170, 22);
      p.strokeWeight(1);
      const horizon = p.height * 0.68;
      for (let i = -8; i <= 8; i += 1) p.line(p.width / 2, horizon, p.width / 2 + i * p.width / 6, p.height);
      for (let y = horizon; y < p.height; y += 26) p.line(0, y, p.width, y);
      }
      const state = getState();
      const layout = getLayout();
      if (!layout) return;
      p.push(); p.scale(layout.scale); p.noStroke();
      // Preserve contrast for text on the bright city at every arena width.
      p.fill('#101c30'); p.rect(0,0,layout.width,layout.portrait ? 480 : 392);
      const h = layout.hero, a = layout.arms, origin = layout.emitter;
      const firing = state.phase === 'playing' && state.target !== null;
      host.dataset.pose = firing ? 'fire' : 'idle';
      drawBeam(p,beamFrame(state,layout,p.millis(),reduced.matches));
      if (!drawHero(p,layout,assets,firing)) {
      p.fill('#acbdce');
      p.quad(a.x, a.y + a.height, a.x + 40, a.y + a.height * .5,
        origin.x + 36, origin.y - (firing ? 8 : -22), origin.x + 36, origin.y + 36);
      p.fill('#597fa6');
      p.quad(a.x + a.width, a.y + a.height, a.x + a.width - 40, a.y + a.height * .5,
        origin.x - 36, origin.y - (firing ? 8 : -22), origin.x - 36, origin.y + 36);
      p.fill('#657b93'); p.rect(h.x, (h.y - 24) + h.height * .65, h.width, h.height * .35, 24);
      p.fill('#b9c8d4'); p.ellipse(h.x + h.width / 2, (h.y - 24) + h.height * .35, h.width * .4, h.height * .7);
      p.fill('#dd6472'); p.rect(h.x + h.width * .47, (h.y - 24) + 4, h.width * .06, h.height * .59, 8);
      p.fill('#7ce9e2'); p.ellipse(origin.x, origin.y, 42, 18);
      }
      drawFeedback(p,effects.frame(state,layout,p.millis(),reduced.matches));
      p.pop();
    };
    const originalRemove = p.remove.bind(p);
    p.remove = () => { removed=true; observer?.disconnect(); originalRemove(); };
  }, host);
}
