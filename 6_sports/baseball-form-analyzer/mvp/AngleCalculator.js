/**
 * AngleCalculator - 骨格キーポイントから投球分析用の関節角度を算出するユーティリティ
 *
 * MoveNet のキーポイントインデックス:
 *   5/6: Left/Right Shoulder
 *   7/8: Left/Right Elbow
 *   9/10: Left/Right Wrist
 *   11/12: Left/Right Hip
 *   13/14: Left/Right Knee
 *   15/16: Left/Right Ankle
 */

/**
 * 投球分析に使用する角度ペアの定義。
 * - label:   表示ラベル
 * - vertex:  頂点（角度の中心点）のキーポイントインデックス
 * - pointA:  端点Aのキーポイントインデックス
 * - pointC:  端点Cのキーポイントインデックス
 */
const ANGLE_DEFINITIONS = [
  // ── 左側 ──
  { label: "L腕",  vertex: 7,  pointA: 5,  pointC: 9  },
  { label: "L膝",  vertex: 13, pointA: 11, pointC: 15 },
  { label: "L体",  vertex: 11, pointA: 5,  pointC: 13 },
  // ── 右側 ──
  { label: "R腕",  vertex: 8,  pointA: 6,  pointC: 10 },
  { label: "R膝",  vertex: 14, pointA: 12, pointC: 16 },
  { label: "R体",  vertex: 12, pointA: 6,  pointC: 14 },
];

/**
 * 3つの座標点から、頂点 B における角度を算出する（度数法）。
 *
 * ベクトル BA と BC の内積を用いた cos(θ) から角度を求める。
 * 浮動小数点誤差で acos の定義域を超えないようクランプ処理を行う。
 *
 * @param {{ x: number, y: number }} pointA - 端点A
 * @param {{ x: number, y: number }} pointB - 頂点（角度の中心）
 * @param {{ x: number, y: number }} pointC - 端点C
 * @returns {number} 角度（0〜180°、小数点1位に丸め）
 */
function calculateAngle(pointA, pointB, pointC) {
  const ba = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
  const bc = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  // 2点が重なっている場合は角度を定義できない
  if (magBA === 0 || magBC === 0) return null;

  const dot = ba.x * bc.x + ba.y * bc.y;
  const cosTheta = Math.max(-1, Math.min(1, dot / (magBA * magBC)));

  return Number((Math.acos(cosTheta) * (180 / Math.PI)).toFixed(1));
}

/**
 * 1人分のキーポイント配列から、定義済みの全角度を一括計算する。
 *
 * @param {Array<{ x: number, y: number, confidence: number }>} keypoints
 * @param {number} confidenceThreshold - この値未満のキーポイントは計算対象外
 * @returns {Array<{ label: string, angle: number | null }>}
 */
function calculatePoseAngles(keypoints, confidenceThreshold) {
  return ANGLE_DEFINITIONS.map((def) => {
    const kpA = keypoints[def.pointA];
    const kpB = keypoints[def.vertex];
    const kpC = keypoints[def.pointC];

    // 3点のいずれかが信頼度不足なら角度を算出しない
    const belowThreshold =
      kpA.confidence < confidenceThreshold ||
      kpB.confidence < confidenceThreshold ||
      kpC.confidence < confidenceThreshold;

    return {
      label: def.label,
      angle: belowThreshold ? null : calculateAngle(kpA, kpB, kpC),
    };
  });
}
