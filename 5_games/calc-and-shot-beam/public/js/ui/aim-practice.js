import { AimController } from '../input/aim.js';
import { GestureController, GESTURE_PRESETS, classifyWrists, wristDistance } from '../input/gesture.js?v=20260914-gesture-tune';

export function mountAimPractice(getPose) {
  const byId = id => document.getElementById(id);
  const panel = byId('aim-practice'), calibrate = byId('aim-calibrate');
  const cards = [...byId('aim-cards').children];
  const aim = new AimController();
  const gesture = new GestureController();
  function getControl() {
    const now = performance.now(), pose = active ? getPose() : null;
    return { target: aim.update(pose, now), gesture: gesture.update(pose, now), calibrated: aim.calibrated,
      capturedAt: pose?.capturedAt };
  }
  let active = false, animation;
  // Reaching for a mouse can move wrists out of view; that must not undo setup.
  const canStart = () => active && aim.calibrated;
  function show(target, message, state='unknown') {
    cards.forEach((card, i) => {
      card.classList.toggle('is-aimed', i === target);
      card.classList.toggle('is-firing', i === target && state === 'firing');
      card.querySelector('i').textContent=i===target&&state==='firing'?'✦':'◎';
      if (i === target) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
    if (byId('aim-status').textContent !== message) byId('aim-status').textContent = message;
  }
  function render() {
    if (!active) return;
    const pose = getPose();
    calibrate.disabled = !pose;
    const { target, gesture: state } = getControl();
    byId('body-start').disabled = !canStart();
    const missing = !pose ? '肩が見えていません。カメラに映してね。'
      : !pose.body.left_wrist && !pose.body.right_wrist ? '両手首が見えていません。胸の前に手を出そう。'
      : !pose.body.left_wrist || !pose.body.right_wrist ? '片方の手首が見えていません。手を少しずらそう。'
      : '両手首を認識中。一度離してから近づけよう。';
    const text = { unknown: missing, open: '両手首を認識中。近づけてビームの形を試そう。', charging: '両手首を認識中。そのまま、ためています。', firing: '発射の形を認識！ 手首を離すと止まるよ。' }[state];
    if (byId('gesture-status').textContent !== text) byId('gesture-status').textContent = text;
    const distance = wristDistance(pose), classification = classifyWrists(pose, gesture.settings);
    const distanceLabel = distance === null ? '手首の目印がそろうと、近さを確認できます。'
      : classification === 'near' ? '手首の近さ：発射できる範囲'
      : classification === 'open' ? '手首の近さ：離れている'
      : state === 'open' || state === 'unknown' ? '手首の近さ：もう少し近づけよう' : '手首の近さ：そのままでOK';
    byId('gesture-distance').textContent = distanceLabel;
    byId('gesture-distance').dataset.range = classification;
    show(target, !pose ? '肩がうつるように立ってね。'
      : !aim.calibrated ? 'まんなかに立って「ここをまんなかにする」を押してね。'
      : target === null ? '肩がうつるように立ってね。' : `${target + 1} のカードをねらっているよ`, state);
    animation = requestAnimationFrame(render);
  }
  calibrate.addEventListener('click', () => { aim.calibrate(getPose(), performance.now()); gesture.reset(); });
  byId('aim-range').addEventListener('change', event => { aim.setRange(Number(event.target.value)); gesture.reset(); });
  byId('gesture-sensitivity').addEventListener('change', event => {
    gesture.setSettings(GESTURE_PRESETS[event.target.value]);
  });
  return {
    getControl, canStart,
    getGestureSettings: () => gesture.settings,
    setActive(value) {
      if (value === active) return;
      active = value;
      cancelAnimationFrame(animation);
      aim.reset();
      gesture.reset();
      byId('body-start').disabled = true;
      panel.hidden = !active;
      show(null, '');
      byId('gesture-distance').textContent = '';
      byId('gesture-distance').dataset.range = 'unknown';
      if (active) render();
    },
  };
}
