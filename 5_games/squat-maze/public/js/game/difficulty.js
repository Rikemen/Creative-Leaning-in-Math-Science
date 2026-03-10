// ──────────────────────────────────────────────
// Difficulty — スコアに連動した難易度パラメータの算出
// 対数カーブを用いて序盤は急激に、後半は緩やかに変化させる。
// ──────────────────────────────────────────────

// ── スクロール速度 ──
const BASE_SCROLL_SPEED = 3; // 開始速度（px/frame）
const MAX_SCROLL_SPEED = 40; // 上限速度（人間の反応限界を超えないための安全弁）
const SPEED_GROWTH_RATE = 5; // 対数カーブの傾き
const SPEED_GROWTH_DIV = 500; // この値のスコアで成長が鈍化し始める

/**
 * 現在のスコアからスクロール速度を算出する。
 * 対数カーブにより序盤は体感しやすく加速し、後半は頭打ちになる。
 *
 * @param {number} score - 現在のスコア（移動距離の累計）
 * @returns {number} 現在フレームのスクロール速度（px/frame）
 */
export function getScrollSpeed(score) {
  const raw = BASE_SCROLL_SPEED + SPEED_GROWTH_RATE * Math.log(1 + score / SPEED_GROWTH_DIV);
  return Math.min(raw, MAX_SCROLL_SPEED);
}

// ── 通路幅の最低保証 ──
// スコアに応じて通路幅の下限を徐々に狭める。
// 序盤は広い通路で体を慣らし、後半はスクワットの精度を要求する。
const PASSAGE_RATIO_INITIAL = 0.55; // 初期の通路幅下限（画面高さの55%）
const PASSAGE_RATIO_FLOOR = 0.25; // 絶対下限（画面高さの25%、プレイヤーの約6倍）
const PASSAGE_NARROW_START = 500; // 通路を狭め始めるスコア（約3秒経過時点）
const PASSAGE_NARROW_END = 5000; // 通路が最狭に達するスコア（約28秒経過時点）

/**
 * 現在のスコアから通路幅の最低保証比率を算出する。
 * PASSAGE_NARROW_START 以前は初期値を維持し、
 * 以降は PASSAGE_NARROW_END に向けて線形に縮小する。
 *
 * @param {number} score - 現在のスコア（移動距離の累計）
 * @returns {number} 通路幅の最低保証比率（画面高さに対する割合、0〜1）
 */
export function getMinPassageRatio(score) {
  if (score <= PASSAGE_NARROW_START) return PASSAGE_RATIO_INITIAL;
  if (score >= PASSAGE_NARROW_END) return PASSAGE_RATIO_FLOOR;

  // 線形補間で序盤→終盤にかけて滑らかに縮小
  const progress = (score - PASSAGE_NARROW_START) / (PASSAGE_NARROW_END - PASSAGE_NARROW_START);
  return PASSAGE_RATIO_INITIAL + (PASSAGE_RATIO_FLOOR - PASSAGE_RATIO_INITIAL) * progress;
}

// ── 障害物の高さ上限 ──
// スコアに応じて障害物が占有できる通路幅の割合を増加させる。
// 序盤は小さなブロック、後半はフラッピー風の縦長バリアが出現する。
const OBSTACLE_HEIGHT_RATIO_INITIAL = 0.15; // 初期: 通路幅の15%まで
const OBSTACLE_HEIGHT_RATIO_MAX     = 0.80; // 上限: 通路幅の80%まで
const OBSTACLE_GROW_START           = 300;  // 障害物が大きくなり始めるスコア
const OBSTACLE_GROW_END             = 4000; // 最大サイズに達するスコア

/**
 * 現在のスコアから障害物が占有できる通路幅の最大比率を算出する。
 * この比率を通路幅（px）に掛けることで実際の max height が決まる。
 *
 * @param {number} score - 現在のスコア（移動距離の累計）
 * @returns {number} 障害物が通路幅に対して占有できる最大比率（0〜1）
 */
export function getObstacleMaxHeightRatio(score) {
  if (score <= OBSTACLE_GROW_START) return OBSTACLE_HEIGHT_RATIO_INITIAL;
  if (score >= OBSTACLE_GROW_END) return OBSTACLE_HEIGHT_RATIO_MAX;

  const progress = (score - OBSTACLE_GROW_START) / (OBSTACLE_GROW_END - OBSTACLE_GROW_START);
  return OBSTACLE_HEIGHT_RATIO_INITIAL + (OBSTACLE_HEIGHT_RATIO_MAX - OBSTACLE_HEIGHT_RATIO_INITIAL) * progress;
}

// ── 障害物の出現頻度 ──
// スコアに応じてスポーン間隔を短縮し、障害物の密度を上げる。
// 他の難易度パラメータより先に頻度上昇を開始することで、
// 序盤から「障害物が増えてきた」という体感を与える。
const SPAWN_INTERVAL_INITIAL = 90;  // 初期間隔（フレーム数、約1.5秒@60fps）
const SPAWN_INTERVAL_MIN     = 30;  // 最短間隔（フレーム数、約0.5秒@60fps）
const SPAWN_FREQ_START       = 200; // 頻度上昇を開始するスコア（最も早い難易度変化）
const SPAWN_FREQ_END         = 3000; // 最高頻度に達するスコア

/**
 * 現在のスコアから障害物のスポーン間隔を算出する。
 * SPAWN_FREQ_START 以前は初期間隔を維持し、
 * 以降は SPAWN_FREQ_END に向けて線形に短縮する。
 *
 * @param {number} score - 現在のスコア（移動距離の累計）
 * @returns {number} 障害物のスポーン間隔（フレーム数）
 */
export function getSpawnInterval(score) {
  if (score <= SPAWN_FREQ_START) return SPAWN_INTERVAL_INITIAL;
  if (score >= SPAWN_FREQ_END) return SPAWN_INTERVAL_MIN;

  const progress = (score - SPAWN_FREQ_START) / (SPAWN_FREQ_END - SPAWN_FREQ_START);
  return SPAWN_INTERVAL_INITIAL + (SPAWN_INTERVAL_MIN - SPAWN_INTERVAL_INITIAL) * progress;
}
