import { SoundBank } from '../audio/sound.js?v=20260916-beam-audio';

const scene = document.getElementById('scene');
const arms = document.getElementById('arms');
const idle = document.getElementById('idle');
const fire = document.getElementById('fire');
const sound = document.getElementById('sound');
const caption = document.getElementById('scene-caption');
const beamSound = new SoundBank();

function stopBeam() {
  beamSound.stopAll();
}

function setPose(firing) {
  scene.classList.toggle('firing', firing);
  arms.src = firing ? 'assets/images/arms-fire-v1.png' : 'assets/images/arms-idle-v1.png';
  arms.alt = firing ? '銀と赤のヒーローの発射腕' : '銀と赤のヒーローの待機腕';
  idle.setAttribute('aria-pressed', String(!firing));
  fire.setAttribute('aria-pressed', String(firing));
  caption.textContent = firing ? 'ねらって ビーム！' : 'ポーズをえらんでね';
  stopBeam();
  if (firing && sound.checked) {
    document.querySelectorAll('audio').forEach(audio => audio.pause());
    beamSound.unlock();
    beamSound.play('beamFire');
    beamSound.play('beam');
  }
}

idle.addEventListener('click', () => setPose(false));
fire.addEventListener('click', () => setPose(true));
sound.addEventListener('change', () => {
  if (!sound.checked) stopBeam();
});
document.querySelectorAll('audio').forEach((current) => {
  current.volume = 0.5;
  current.addEventListener('play', () => {
    stopBeam();
    document.querySelectorAll('audio').forEach((other) => {
      if (current !== other) other.pause();
    });
  });
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopBeam();
    document.querySelectorAll('audio').forEach((audio) => audio.pause());
  }
});
window.addEventListener('pagehide', stopBeam);
