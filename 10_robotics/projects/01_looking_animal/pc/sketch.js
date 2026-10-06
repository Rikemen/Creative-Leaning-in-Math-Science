import { FaceDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

let faceDetector = null;

// MediaPipe の初期化関数
async function initMediaPipe() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      delegate: "GPU"
    },
    runningMode: "VIDEO"
  });

  console.log("MediaPipe FaceDetector の準備が完了しました！");
}

// スクリプト読み込み時に初期化を開始
initMediaPipe();

/**
 * 顔の中心X座標を「画面上の見た目」基準で 0〜1 に正規化する（左端 = 0、右端 = 1）。
 *
 * MediaPipe の boundingBox は反転前のカメラ生映像の座標で返ってくる。
 * 画面は鏡のように反転表示しているため、そのままだと左右が逆になる。
 * サーボの向きは「画面で見えている向き」と一致させたいので 1 - x で反転する。
 */
function toScreenNormalizedCenterX(boundingBox, videoWidth) {
  const rawCenterX = (boundingBox.originX + boundingBox.width / 2) / videoWidth;
  return 1 - rawCenterX;
}

/**
 * 一番大きく映っている顔（=一番近い人）を選ぶ
 */
function selectTargetFace(detections) {
  if (!detections || detections.length === 0) return null;

  return detections.reduce((largest, current) => {
    const largestArea = largest.boundingBox.width * largest.boundingBox.height;
    const currentArea = current.boundingBox.width * current.boundingBox.height;
    return currentArea > largestArea ? current : largest;
  });
}

// p5.js を Instance Mode で定義
const sketch = (p) => {
  let capture;
  let targetX = null; // 0〜1で正規化された顔の中心X座標。誰もいないときは null
  let headAngle = 90; // 現在のサーボの角度
  let targetAngle = 90; // サーボが向かうべき目標の角度
  let lastSeenAt = 0; // 最後に顔を検出した時刻（ミリ秒）
  let firstSeenAt = 0; // 誰もいない状態から顔を新しく発見した時刻（ミリ秒）
  let isFacePresent = false; // 前のフレームで顔が検出されていたか

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p.angleMode(p.DEGREES); // 角度の指定を度数法（0〜360）にする

    // カメラ映像の取得を開始
    capture = p.createCapture(p.VIDEO);
    capture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    // HTML上のvideo要素は非表示にし、p5.jsのキャンバス上だけに描画する
    capture.hide();
  };

  p.draw = () => {
    p.background(40, 120, 160);

    if (!capture.loadedmetadata) return;

    // MediaPipe の準備が終わる前は検出をスキップし、空の結果として扱う
    // capture.elt は裏側に隠れている本来の <video> 要素
    const detections = faceDetector
      ? faceDetector.detectForVideo(capture.elt, performance.now()).detections
      : [];

    const targetFace = selectTargetFace(detections);

    p.push();
    // 映像を鏡のように左右反転する
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(capture, 0, 0, p.width, p.height);

    // 検出されたすべての顔に四角を描く（反転座標系の中なので、映像上の顔と位置が一致する）
    p.noFill();
    p.strokeWeight(4);
    for (const detection of detections) {
      const box = detection.boundingBox;
      if (detection === targetFace) {
        p.stroke(255, 0, 0); // ターゲットの顔は赤色
      } else {
        p.stroke(0, 255, 0); // それ以外の顔は緑色
      }
      p.rect(box.originX, box.originY, box.width, box.height);
    }
    p.pop();

    // 文字は反転座標系の外で描く（中で描くと鏡文字になる）
    drawFaceCenterLabel(targetFace);

    // 顔がある場合は、その位置（0〜1）を角度（30〜150度）に変換して記録する
    if (targetX !== null) {
      if (!isFacePresent) {
        // 顔を新しく発見した瞬間
        firstSeenAt = p.millis();
        isFacePresent = true;
      }
      lastSeenAt = p.millis();

      // 発見してから 0.5秒（500ミリ秒）経過したら目標角度を更新する（気づくまでの「間」）
      if (p.millis() - firstSeenAt > 500) {
        targetAngle = p.map(targetX, 0, 1, 30, 150);
      }
    } else {
      isFacePresent = false;
      // 顔がない状態が 2000ミリ秒（2秒）続いたら正面を向く
      if (p.millis() - lastSeenAt > 2000) {
        targetAngle = 90;
      }
    }

    // 常に、現在の角度から目標の角度へ 0.1 の割合で少しずつ近づける（平滑化）
    headAngle = p.lerp(headAngle, targetAngle, 0.1);

    // 仮想の首を描く
    p.push();
    p.translate(p.width / 2, p.height); // 画面下部の中央を起点にする
    p.rotate(headAngle - 90); // 90度のときに真上を向くように補正

    // 首（線）
    p.stroke(255);
    p.strokeWeight(16);
    p.line(0, 0, 0, -120);

    // 頭（円）
    p.noStroke();
    p.fill(200);
    p.circle(0, -120, 60);
    p.pop();
  };

  function drawFaceCenterLabel(targetFace) {
    let label;

    if (targetFace) {
      const targetBox = targetFace.boundingBox;
      // boundingBox は実映像の解像度基準なので、キャンバス幅ではなく videoWidth で割る
      targetX = toScreenNormalizedCenterX(targetBox, capture.elt.videoWidth);
      // 生の値は桁が長く毎フレーム細かく揺れて読めないため、小数第2位までに丸める
      label = `faceX: ${targetX.toFixed(2)}`;
    } else {
      targetX = null;
      label = "誰もいない";
    }

    p.noStroke();
    p.fill(0, 0, 0, 160);
    p.rect(10, 10, 150, 36, 6);
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(label, 20, 28);
  }
};

// p5.js のインスタンスを生成して起動
new p5(sketch);
