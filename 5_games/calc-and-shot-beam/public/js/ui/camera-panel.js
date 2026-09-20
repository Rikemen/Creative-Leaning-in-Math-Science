import { CameraController } from '../input/camera.js?v=20260914-gesture-tune';
import { loadBodyPose } from '../input/body-pose.js';
import { mountPosePreview } from './pose-preview.js?v=20260914-gesture-tune';
import { mountAimPractice } from './aim-practice.js?v=20260914-gesture-tune';

export function mountCameraPanel({ beforeStart, onTouch, onBodyStart, onStop }) {
  const byId = id => document.getElementById(id);
  const video = byId('camera-preview');
  const button = byId('camera-start');
  const stop = byId('camera-stop');
  let practice;
  const posePreview = mountPosePreview(byId('camera-pose'), byId('camera-detection'), () => practice.getGestureSettings());
  practice = mountAimPractice(posePreview.getPose);
  const messages = {
    requesting: 'カメラの許可をまっています。ブラウザで「許可」をえらんでね。',
    loading: 'からだを見つける準備中です。少しまってね。',
    ready: 'カメラの準備ができました！',
    stopped: 'カメラを止めました。カードを押してあそべます。',
  };
  const errors = {
    denied: 'カメラが許可されませんでした。ブラウザの設定で許可して、もう一度ためせます。',
    missing: 'カメラが見つかりません。接続を確認してね。',
    timeout: '準備に時間がかかっています。接続を確認して、もう一度ためしてね。',
    model: 'からだを見つける準備に失敗しました。通信を確認してね。',
    unavailable: 'カメラを開けませんでした。HTTPSまたはlocalhostで開き、他のアプリのカメラを閉じてね。',
    disconnected: 'カメラとの接続が切れました。接続を確認してね。',
  };
  const camera = new CameraController({
    video,
    getUserMedia: constraints => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable');
      return navigator.mediaDevices.getUserMedia(constraints);
    },
    loadModel: loadBodyPose,
    onState: ({ state, reason }) => {
      practice.setActive(state === 'ready');
      const active = ['requesting', 'loading', 'ready'].includes(state);
      button.disabled = active;
      button.textContent = state === 'error' ? 'もう一度ためす' : 'カメラを接続する';
      stop.hidden = !active;
      byId('camera-view').hidden = !['loading', 'ready'].includes(state);
      if (['requesting', 'stopped', 'error'].includes(state)) posePreview.reset();
      if (['stopped', 'error'].includes(state)) onStop?.();
      byId('camera-status').textContent = state === 'error'
        ? `${errors[reason]}「マウス・タッチであそぶ」でもつづけられます。` : messages[state];
      byId('camera-panel').setAttribute('aria-busy', String(['requesting', 'loading'].includes(state)));
    },
    onPoses: (poses, frame) => posePreview.update(poses, frame),
  });
  button.addEventListener('click', () => { beforeStart(); void camera.start(); });
  stop.addEventListener('click', () => camera.stop());
  byId('camera-touch').addEventListener('click', onTouch);
  byId('body-start').addEventListener('click', () => onBodyStart?.());
  document.addEventListener('visibilitychange', () => { if (document.hidden) camera.stop(); });
  window.addEventListener('pagehide', () => camera.stop());
  return {
    start: () => {
      beforeStart();
      // Opening settings keeps the live stream and its calibrated position.
      if (!['requesting', 'loading', 'ready'].includes(camera.state)) void camera.start();
    },
    stop: () => camera.stop(), getControl: practice.getControl, canStart: practice.canStart,
  };
}
