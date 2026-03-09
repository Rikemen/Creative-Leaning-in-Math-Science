// ──────────────────────────────────────────────
// PoseTracker — ml5 BodyPose の初期化と検出管理
// カメラ映像から姿勢推定を行い、キーポイント情報を提供する。
// ゲーム本体は getPoses() で最新の検出結果を取得するだけでよい。
// ──────────────────────────────────────────────

/** @type {Array} 最新のポーズ検出結果 */
let poses = [];

/** @type {object|null} ml5 BodyPose モデルインスタンス */
let bodyPoseModel = null;

/** @type {p5.Element|null} カメラ映像の p5 要素 */
let videoElement = null;

/**
 * カメラと ml5 BodyPose モデルを初期化し、検出を開始する。
 * setup() 内で await して呼ぶことを想定。
 * @param {p5} p - p5 インスタンス
 * @returns {Promise<void>}
 */
export async function initPoseTracker(p) {
  videoElement = p.createCapture(p.VIDEO);
  videoElement.size(p.windowWidth, p.windowHeight);
  videoElement.hide();

  bodyPoseModel = await ml5.bodyPose('MoveNet', { flipped: true });
  bodyPoseModel.detectStart(videoElement, (results) => {
    poses = results;
  });
}

/**
 * 最新のポーズ検出結果を返す。
 * 検出前や人物が見つからない場合は空配列を返す。
 * @returns {Array} ポーズ配列（各要素に keypoints を含む）
 */
export function getPoses() {
  return poses;
}

/**
 * 鼻のキーポイントの Y 座標を返す。
 * プレイヤー位置の決定に使用する想定。
 * 検出できない場合は null を返す。
 * @returns {number|null} 鼻の Y 座標、または null
 */
export function getNoseY() {
  if (poses.length === 0) return null;

  // MoveNet のキーポイント index 0 = 鼻
  const nose = poses[0].keypoints[0];
  if (!nose || nose.confidence < 0.3) return null;

  return nose.y;
}

/**
 * ウィンドウリサイズ時にカメラ映像のサイズを更新する。
 * @param {p5} p - p5 インスタンス
 */
export function onResizePoseTracker(p) {
  if (videoElement) {
    videoElement.size(p.windowWidth, p.windowHeight);
  }
}
