import { GameSession } from '../game/session.js';
import { bindPointerInput } from '../input/pointer.js';
import { mountSketch } from '../render/sketch.js?v=20260914-gesture-tune';
import { mountCameraPanel } from './camera-panel.js?v=20260914-gesture-tune';
import { BodyInput } from '../input/body-input.js?v=20260914-gesture-tune';
import { RecoveryController } from '../input/recovery.js?v=20260914-gesture-tune';
import { mountLayout } from '../render/layout.js?v=20260914-gesture-tune';
import {SoundBank} from '../audio/sound.js?v=20260916-beam-audio';
import {ScreenFlow,SCREEN_COPY,PAUSE_COPY} from './screens.js';

const game = new GameSession();
const sound=new SoundBank();
const screens=new ScreenFlow();
const byId = id => document.getElementById(id);
const choices = byId('choices');
const layout = mountLayout(document.querySelector('.arena'), choices);
let bodyPlaying = false;
let latestBodyControl = null;
let playMode = 'select';
let cameraSetup = false;
let previewVisible = false;
const input = bindPointerInput(choices, game, () => !bodyPlaying);
const bodyInput = new BodyInput(game);
const recovery = new RecoveryController(game, bodyInput);
const start = byId('start');
const pause = byId('pause');
let drawnQuestion = -1;
let drawnPhase = '';
let latest = game.snapshot();
const camera = mountCameraPanel({ beforeStart: () => pauseGame('camera-setup'), onTouch: startTouchGame,
  onBodyStart: startBodyGame, onStop: () => { if (bodyPlaying) pauseGame('camera'); } });


function syncGame() {
  latest=game.snapshot();
  sound.update(latest);
  render(latest);
}

function showHint(problem) {
  const hint = byId('counting-hint');
  hint.replaceChildren();
  for (const [index, amount] of [problem.left, problem.right].entries()) {
    if (index) hint.append(document.createTextNode('+'));
    const group = document.createElement('span');
    group.className = 'dot-group';
    for (let n = 0; n < amount; n += 1) group.append(document.createElement('i'));
    hint.append(group);
  }
}

function render(s) {
  document.querySelector('.game-shell').dataset.mode=playMode;
  document.querySelector('.game-shell').dataset.view=cameraSetup?'settings':'game';
  document.querySelector('.arena').classList.toggle('is-title',playMode==='select'&&screens.screen!=='practice');
  byId('camera-setup').hidden=!cameraSetup;
  document.querySelector('.play-stage').hidden=cameraSetup;
  const showMonitor=playMode==='camera'&&!cameraSetup&&previewVisible;
  byId('camera-monitor').hidden=!showMonitor;
  document.querySelector('.play-stage').classList.toggle('with-camera',showMonitor);
  const previewSlot=byId(cameraSetup?'settings-preview-slot':'camera-monitor-content');
  if(byId('camera-view').parentElement!==previewSlot)previewSlot.append(byId('camera-view'));
  byId('change-mode').hidden=playMode==='select'||cameraSetup;
  byId('open-camera-settings').hidden=playMode!=='camera'||cameraSetup;
  byId('toggle-camera-preview').hidden=playMode!=='camera'||cameraSetup;
  byId('toggle-camera-preview').setAttribute('aria-expanded',String(showMonitor));
  byId('toggle-camera-preview').textContent=showMonitor?'骨格を隠す':'骨格を表示';
  byId('choose-camera').hidden=playMode!=='select'||screens.screen==='practice';
  byId('practice').hidden=playMode==='camera';
  byId('time').textContent = s.remaining;
  byId('score').textContent = s.score;
  byId('time-fill').style.transform = `scaleX(${s.remaining / 60})`;
  if (s.problem && drawnQuestion !== s.questionId) {
    drawnQuestion = s.questionId;
    byId('problem').textContent = `${s.problem.left} + ${s.problem.right} = ?`;
    showHint(s.problem);
    // ノードを再利用し、pointer captureやキーボードフォーカスを失わせない。
    if (!choices.children.length) {
      for (let i = 0; i < 4; i += 1) {
        const card = document.createElement('button');
        card.type = 'button';
        card.dataset.choice = i;
        card.className = 'answer-card';
        card.innerHTML = '<span class="card-label">ANSWER</span><span class="number"></span><span class="card-hp" aria-hidden="true"><i></i></span>';
        choices.append(card);
      }
      layout.placeCards();
    }
    [...choices.children].forEach((card, i) => {
      card.querySelector('.number').textContent = s.choices[i];
      card.setAttribute('aria-label', `答え ${s.choices[i]}、押し続けて発射`);
    });
  }
  [...choices.children].forEach((card, i) => {
    card.disabled = s.phase !== 'playing';
    card.classList.toggle('is-target', s.target === i);
    card.classList.toggle('is-barrier', s.target === i && s.feedback === 'barrier');
    card.classList.toggle('is-broken', s.phase === 'breaking' && s.choices[i] === s.problem.answer);
    card.classList.toggle('is-cracked', s.hp<70 && s.choices[i]===s.problem.answer);
    const hp = s.choices[i] === s.problem.answer ? s.hp : 100;
    card.querySelector('.card-hp i').style.transform = `scaleX(${hp / 100})`;
  });
  const messages = {
    idle: s.held ? 'いちど はなして、つぎを ねらおう' : 'こたえのカードを おしつづけよう',
    hit: 'いいぞ！ そのまま おしてね',
    barrier: 'バリア！ べつのカードを ねらおう',
    destroyed: 'こわれた！ ＋1まい',
  };
  if (bodyPlaying) {
    messages.idle = bodyInput.armed && !s.held ? '左右にねらって、手首を近づけよう' : '一度手首を離してから、近づけよう';
    if (latestBodyControl?.gesture === 'unknown') messages.idle = bodyInput.armed ? '両手首をもう一度映してね' : '両手首を映して、一度離してね';
    messages.hit = 'いいぞ！ 手首を近づけたまま！';
  }
  const trackingState = bodyPlaying ? recovery.state : 'inactive';
  const recovering = ['waiting', 'countdown'].includes(trackingState);
  const trackingMessages = {
    waiting: '肩を映してね · 時間は止まっています',
    countdown: `${recovery.remaining} びょうでスタート`,
    lost: '肩が見えないよ。カメラに映してね',
  };
  const feedbackText = trackingMessages[trackingState] || messages[s.feedback];
  const feedback = byId('feedback');
  if (feedback.textContent !== feedbackText) feedback.textContent = feedbackText;
  feedback.dataset.kind = trackingMessages[trackingState] ? 'idle' : s.feedback;
  feedback.dataset.tracking = trackingState;
  pause.disabled = !['playing', 'breaking'].includes(s.phase)
    && !recovering;
  pause.setAttribute('aria-label', recovering ? '休む（自動再開を止める）' : '一時停止');
  byId('start-options').hidden=!['ready','result'].includes(s.phase)||screens.screen==='practice';
  if (drawnPhase !== s.phase) {
    drawnPhase = s.phase;
    const show = ['ready', 'paused', 'result'].includes(s.phase);
    byId('overlay').hidden = !show;
    byId('result-score').hidden = s.phase !== 'result';
    const copy=SCREEN_COPY[s.phase];
    if(copy&&screens.screen!=='practice'){byId('dialog-eyebrow').textContent=copy.eyebrow;byId('dialog-title').textContent=copy.title;byId('dialog-description').textContent=copy.description;start.textContent=copy.button;}
    if (s.phase === 'result'&&!cameraSetup) {
      bodyPlaying = false;
      recovery.reset();
      bodyInput.reset();
      camera.stop();
      byId('result-score').textContent = `${s.score} まい`;
    } else if (s.phase === 'paused') {
      byId('dialog-description').textContent=PAUSE_COPY[s.pauseReason]||PAUSE_COPY.manual;
    }
    if (show&&!cameraSetup&&!recovering) start.focus({ preventScroll: true });
  }
  // Recognition guidance belongs inside the arena, without obscuring the game.
  byId('overlay').hidden = cameraSetup || recovering || !['ready', 'paused', 'result'].includes(s.phase);
  if(playMode==='select'&&screens.screen!=='practice'){
    byId('dialog-title').textContent='たしざんビーム';
    byId('dialog-description').textContent='どちらも同じヒーローで、60びょうチャレンジ！';
    start.textContent='マウスで遊ぶ →';
  }else if(playMode==='camera'&&!recovering&&['paused','result'].includes(s.phase)){
    start.textContent=s.phase==='result'?'カメラでもういちど →':'カメラでつづける →';
  }
  byId('mode-note').textContent=playMode==='camera'?'体を左右に動かしてねらう → 手首を近づけて発射':playMode==='mouse'?'マウス・タッチでカードを押し続ける → 離して次の問題へ':'カメラは体で操作。マウス・タッチはカードを押し続けて発射。';
}

function startTouchGame(event) {
  sound.unlock();
  if(event?.currentTarget===start&&start.disabled)return;
  playMode='mouse';cameraSetup=false;
  drawnPhase='';
  start.disabled=false;cancelPractice();
  if(screens.screen==='practice')screens.finishPractice();
  byId('touch-practice').hidden=true;
  if (bodyPlaying) recovery.update(camera.getControl(), performance.now());
  bodyPlaying = false;
  recovery.reset();
  bodyInput.cancel(performance.now());
  camera.stop();
  input.cancel(performance.now());
  const phase = game.snapshot().phase;
  if (phase === 'paused') game.resume(performance.now());
  else if (['ready', 'result'].includes(phase)) { drawnQuestion = -1; game.settings=screens.start();game.start(performance.now()); }
  syncGame();
  choices.querySelector('button')?.focus({ preventScroll: true });
}
function startBodyGame() {
  sound.unlock();byId('touch-practice').hidden=true;start.disabled=false;
  if (bodyPlaying||!cameraSetup) return;
  if (!camera.canStart()) return;
  latestBodyControl = camera.getControl();
  playMode='camera';cameraSetup=false;
  drawnPhase='';
  input.cancel(performance.now());
  bodyInput.cancel(performance.now());
  const phase = game.snapshot().phase;
  const now = performance.now();
  if (['ready', 'result'].includes(phase)) {
    drawnQuestion = -1;
    game.settings = screens.start();
    game.start(now);
    // Start the clock only after the player returns from the mouse to the camera.
    game.pause(now, 'tracking');
  }
  recovery.prepareResume(now);
  bodyPlaying = true;
  syncGame();
  pause.focus({preventScroll:true});
  document.querySelector('.play-stage').scrollIntoView({block:'start'});
}
function chooseCamera(){
  sound.unlock();cancelPractice();screens.finishPractice();start.disabled=false;
  byId('touch-practice').hidden=true;
  playMode='camera';cameraSetup=true;
  camera.start();syncGame();
  byId('camera-settings-title').focus({preventScroll:true});
  window.scrollTo(0,0);
}
start.addEventListener('click', event => {
  if(playMode==='camera')chooseCamera();else startTouchGame(event);
});
byId('choose-camera').addEventListener('click',chooseCamera);
byId('open-camera-settings').addEventListener('click',chooseCamera);
function chooseMode(){
  pauseGame('manual');camera.stop();cameraSetup=false;playMode='select';
  previewVisible=false;
  cancelPractice();screens.finishPractice();start.disabled=false;byId('touch-practice').hidden=true;
  drawnPhase='';syncGame();document.querySelector('.arena').scrollIntoView({block:'start'});
}
byId('change-mode').addEventListener('click',chooseMode);
byId('settings-back').addEventListener('click',chooseMode);
function pauseGame(reason = 'manual') {
  sound.stopAll();cancelPractice();
  if (bodyPlaying) recovery.update(camera.getControl(), performance.now());
  bodyPlaying = false;
  recovery.reset();
  drawnPhase = ''; // Replace any automatic recovery dialog with manual pause text.
  bodyInput.reset();
  input.cancel(performance.now());
  game.pause(performance.now(),reason);
  syncGame();
}
pause.addEventListener('click', () => pauseGame('manual'));
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame('hidden'); },{capture:true});
window.addEventListener('blur', () => pauseGame('blur'));
window.addEventListener('pagehide', () => pauseGame('pagehide'));

function frame(now) {
  if (bodyPlaying) {
    const control = camera.getControl();
    latestBodyControl = control;
    recovery.update(control, performance.now());
    [...choices.children].forEach((card, index) => card.classList.toggle('is-aimed', recovery.state === 'tracking' && control.target === index));
  } else [...choices.children].forEach(card => card.classList.remove('is-aimed'));
  // DOMイベント側のperformance.now()より古いRAF時刻を使わない。
  game.tick(Math.max(now, performance.now()));
  latest = game.snapshot();
  sound.update(latest);
  render(latest);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function startRenderer() {
  if (typeof window.p5 === 'function') mountSketch(byId('game-canvas'), () => latest, layout.getLayout);
  else byId('renderer-note').hidden = false;
}
if(document.readyState==='complete')startRenderer();
else window.addEventListener('load',startRenderer,{once:true});

byId('mute').addEventListener('click',()=>{sound.unlock();sound.setMuted(!sound.muted);byId('mute').textContent=sound.muted?'音なし':'音あり';byId('mute').setAttribute('aria-pressed',String(sound.muted));});
byId('level').addEventListener('change',event=>screens.selectLevel(event.target.value));
let practiceTimer=null;
function cancelPractice(){clearTimeout(practiceTimer);practiceTimer=null;byId('practice-card').classList.remove('is-target');}
byId('practice').addEventListener('click',()=>{
  sound.unlock();sound.play('button');screens.practice();byId('touch-practice').hidden=false;byId('start-options').hidden=true;
  byId('dialog-title').textContent='おして ためてみよう';byId('dialog-description').textContent='れんしゅうでは時間も点数もかわらないよ。';
  byId('result-score').hidden=true;byId('practice-status').textContent='おす → ためる → はなす';
  start.textContent='ほんばんへ →';start.disabled=true;byId('practice-card').focus();
});
function practiceDown(){
  if(screens.screen!=='practice'||practiceTimer)return;
  byId('practice-card').classList.add('is-target');byId('practice-status').textContent='そのまま…';
  practiceTimer=setTimeout(()=>{practiceTimer=null;byId('practice-status').textContent='できた！ はなして、ほんばんへ';sound.play('break');start.disabled=false;},800);
}
byId('practice-card').addEventListener('pointerdown',event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);practiceDown();});
for(const name of ['pointerup','pointercancel','lostpointercapture'])byId('practice-card').addEventListener(name,cancelPractice);
byId('practice-card').addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)practiceDown();}});
byId('practice-card').addEventListener('keyup',cancelPractice);
byId('practice-card').addEventListener('blur',cancelPractice);

byId('toggle-camera-preview').addEventListener('click',()=>{
  previewVisible=!previewVisible;
  syncGame();
});
