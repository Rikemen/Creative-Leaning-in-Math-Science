export const POSE_SETTINGS = Object.freeze({ minConfidence: .3, minShoulderWidth: .02, maxAgeMs: 250 });
const positive = value => Number.isFinite(value) && value > 0;
const unit = value => Number.isFinite(value) && value >= 0 && value <= 1;

/** Raw ml5 coordinates use video.width/height, not the CSS preview dimensions.
 * Output image coordinates are 0..1, x right / y down in the mirrored view.
 * Anatomical left/right names stay unchanged. Body units use shoulder width
 * in isotropic source pixels, centered on the shoulders (also x right / y down).
 */
export function normalizePose(frame, { mirrored = true } = {}) {
  const { poses, width, height, capturedAt } = frame;
  if (!positive(width) || !positive(height) || !Array.isArray(poses) || poses.length !== 1) return null;
  const points = poses[0]?.keypoints;
  if (!Array.isArray(points)) return null;
  const keypoints = Object.create(null), seen = new Set();
  for (const point of points) {
    if (!point || typeof point.name !== 'string') continue;
    if (seen.has(point.name)) return null;
    seen.add(point.name);
    if (!unit(point.confidence) || point.confidence < POSE_SETTINGS.minConfidence
      || !unit(point.x / width) || !unit(point.y / height)) continue;
    keypoints[point.name] = { x: mirrored ? 1 - point.x / width : point.x / width,
      y: point.y / height, confidence: point.confidence };
  }
  const left = keypoints.left_shoulder, right = keypoints.right_shoulder;
  if (!left || !right) return null;
  const shoulderCenter = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const pixels = Math.hypot((left.x - right.x) * width, (left.y - right.y) * height);
  if (pixels / width < POSE_SETTINGS.minShoulderWidth) return null;
  const body = Object.create(null);
  for (const [name, point] of Object.entries(keypoints)) {
    body[name] = { x: (point.x - shoulderCenter.x) * width / pixels,
      y: (point.y - shoulderCenter.y) * height / pixels };
  }
  return { capturedAt, width, height, keypoints, body, shoulderCenter, shoulderWidth: pixels / width };
}

/** object-fit: contain, centered; includes both pillarbox and letterbox offsets. */
export function projectPoint(point, source, viewport) {
  if (!point || !unit(point.x) || !unit(point.y) || !positive(source.width) || !positive(source.height)
    || !positive(viewport.width) || !positive(viewport.height)) return null;
  const scale = Math.min(viewport.width / source.width, viewport.height / source.height);
  return { x: (viewport.x ?? 0) + (viewport.width - source.width * scale) / 2 + point.x * source.width * scale,
    y: (viewport.y ?? 0) + (viewport.height - source.height * scale) / 2 + point.y * source.height * scale };
}

export class PoseNormalizer {
  constructor() { this.reset(); }
  reset() { this.latest = null; this.lastTimestamp = -Infinity; }
  update(frame, now) {
    const timestamp = frame?.capturedAt;
    if (!Number.isFinite(now) || !Number.isFinite(timestamp) || timestamp < 0
      || timestamp > now || timestamp <= this.lastTimestamp) return this.get(now);
    this.lastTimestamp = timestamp;
    this.latest = now - timestamp < POSE_SETTINGS.maxAgeMs ? normalizePose(frame) : null;
    return this.get(now);
  }
  get(now) {
    if (!this.latest || !Number.isFinite(now) || now < this.latest.capturedAt
      || now - this.latest.capturedAt >= POSE_SETTINGS.maxAgeMs) return null;
    return this.latest;
  }
}
