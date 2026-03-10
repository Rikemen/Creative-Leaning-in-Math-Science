// ──────────────────────────────────────────────
// SoundManager — ゲーム内の SE / BGM を一元管理する
// Web Audio API を直接利用し、p5.sound への依存を排除する。
// p5.js v2 のインスタンスモードで p5.sound がプロトタイプに
// 正しくアタッチされない問題を回避するための設計判断。
//
// 全サウンドは setup() 内の initSounds() で非同期ロードされ、
// ロード完了後に再生メソッドが利用可能になる。
// ロード未完了時は再生を静かにスキップする（クラッシュしない）。
// ──────────────────────────────────────────────

/** @type {AudioContext|null} */
let audioCtx = null;

/** @type {Object<string, AudioBuffer>} ロード済みのバッファを名前で管理 */
const buffers = {};

/** @type {AudioBufferSourceNode|null} 現在再生中の BGM ノード */
let bgmSource = null;

/** @type {GainNode|null} BGM 用のゲインノード（音量制御用） */
let bgmGain = null;

/**
 * AudioBuffer を fetch + decodeAudioData で読み込むヘルパー。
 * @param {string} url - 音声ファイルの URL
 * @returns {Promise<AudioBuffer>}
 */
async function loadBuffer(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
}

/**
 * 全サウンドファイルを非同期に読み込む。
 * AudioContext はユーザー操作前に作成できるが、
 * resume() はユーザー操作（キー入力）後に呼ぶ必要がある。
 */
export async function initSounds() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    bgmGain = audioCtx.createGain();
    bgmGain.connect(audioCtx.destination);

    const [selectBuf, bgmBuf, hitBuf, deathBuf] = await Promise.all([
      loadBuffer('/sounds/select.mp3'),
      loadBuffer('/sounds/bgm.mp3'),
      loadBuffer('/sounds/hit.mp3'),
      loadBuffer('/sounds/death.mp3')
    ]);

    buffers.select = selectBuf;
    buffers.bgm = bgmBuf;
    buffers.hit = hitBuf;
    buffers.death = deathBuf;
  } catch (error) {
    console.warn('サウンドの読み込みに失敗しました（ゲームは音無しで続行します）:', error);
  }
}

/**
 * ワンショット SE を再生するヘルパー。
 * AudioContext が suspended 状態ならまず resume してから再生する。
 * @param {string} name - buffers に登録されたキー名
 */
function playSE(name) {
  if (!audioCtx || !buffers[name]) return;

  // ブラウザの AudioContext ポリシー対応: ユーザー操作後に resume
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffers[name];
  source.connect(audioCtx.destination);
  source.start(0);
}

// ────────────────────────────────
// 公開メソッド
// ────────────────────────────────

/** ボタン押下時の SE を再生する（スタート、リトライ等） */
export function playSelect() {
  playSE('select');
}

/**
 * BGM を開始する。既に再生中なら何もしない。
 * ブラウザの AudioContext ポリシーにより、
 * ユーザー操作（キー入力）後に呼ぶ必要がある。
 */
export function playBGM() {
  if (!audioCtx || !buffers.bgm || bgmSource) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  bgmSource = audioCtx.createBufferSource();
  bgmSource.buffer = buffers.bgm;
  bgmSource.loop = true;
  bgmSource.connect(bgmGain);
  bgmSource.start(0);

  // 再生終了時（stop() 呼び出し含む）に参照をクリアする
  bgmSource.onended = () => {
    bgmSource = null;
  };
}

/** BGM を停止する（ゲームオーバー時に呼ぶ） */
export function stopBGM() {
  if (!bgmSource) return;
  bgmSource.stop();
  bgmSource = null;
}

/** 被弾時の SE を再生する（ゲームオーバーでない場合） */
export function playHit() {
  playSE('hit');
}

/** ゲームオーバー時の SE を再生する */
export function playDeath() {
  playSE('death');
}
