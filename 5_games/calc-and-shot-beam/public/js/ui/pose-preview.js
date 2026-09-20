import { PoseNormalizer, POSE_SETTINGS, projectPoint } from '../input/pose-normalizer.js';
import {classifyWrists} from '../input/gesture.js?v=20260914-gesture-tune';

const joints = ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'];
const bones = [[0, 1], [0, 2], [2, 4], [1, 3], [3, 5]];
const viewport = { width: 640, height: 480 };

export function mountPosePreview(svg, status, getGestureSettings=()=>undefined) {
  const normalizer = new PoseNormalizer();
  let expiry;
  function render(pose, active) {
    svg.replaceChildren();
    status.textContent = pose ? (pose.keypoints.left_wrist && pose.keypoints.right_wrist
      ? '肩と両手首が見つかったよ。目印を見てね。' : '肩は見つかったよ。ビームを出すには両手首も映してね。')
      : active ? '肩と両手首がうつるように、カメラの前に立ってね。' : '';
    if (!pose) return;
    const points = joints.map(name => projectPoint(pose.keypoints[name], pose, viewport));
    function add(type, attributes) {
      const element = document.createElementNS('http://www.w3.org/2000/svg', type);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      svg.append(element);
    }
    for (const [a, b] of bones) {
      if (points[a] && points[b]) add('line', { x1: points[a].x, y1: points[a].y, x2: points[b].x, y2: points[b].y });
    }
    points.forEach((point, i) => {
      if (point) add('circle', { cx: point.x, cy: point.y, r: 10, 'data-joint': joints[i] });
    });
    const [left,right]=points.slice(4);
    if(left&&right){
      // Connect the two wrists so the firing criterion is visible in the monitor.
      add('line',{x1:left.x,y1:left.y,x2:right.x,y2:right.y,
        style:`stroke:${classifyWrists(pose,getGestureSettings())==='near'?'#ffce7a':'#ffffff'};stroke-width:5;stroke-dasharray:12 8`,'data-wrist-gap':'true'});
      add('circle',{cx:(left.x+right.x)/2,cy:(left.y+right.y)/2,r:7,style:'fill:#ffffff;stroke:#17263a'});
    }
  }
  return {
    update(poses, frame) {
      clearTimeout(expiry);
      if (!frame) { normalizer.reset(); render(null, false); return; }
      const now = performance.now();
      const pose = normalizer.update({ ...frame, poses }, now);
      render(pose, true);
      if (pose) expiry = setTimeout(() => render(normalizer.get(performance.now()), true),
        Math.max(0, pose.capturedAt + POSE_SETTINGS.maxAgeMs - now) + 1);
    },
    reset() { clearTimeout(expiry); normalizer.reset(); render(null, false); },
    getPose: () => normalizer.get(performance.now()),
  };
}
