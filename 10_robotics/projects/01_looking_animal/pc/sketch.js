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
  let lastSentAngle = null; // 最後に送信した角度（整数）

  // スライダーの変数
  let lerpSlider, returnDelaySlider, reactionDelaySlider;

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p.angleMode(p.DEGREES); // 角度の指定を度数法（0〜360）にする

    // カメラ映像の取得を開始
    capture = p.createCapture(p.VIDEO);
    capture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    // HTML上のvideo要素は非表示にし、p5.jsのキャンバス上だけに描画する
    capture.hide();

    // UIスライダーの構築
    setupSliders();
  };

  function setupSliders() {
    // --- UIコンテナ（スライダー群を横に並べる親要素） ---
    const uiContainer = p.createDiv();
    uiContainer.style('display', 'flex');
    uiContainer.style('gap', '30px'); // 項目間の隙間
    uiContainer.style('margin-top', '20px');

    // 平滑化
    const col1 = p.createDiv().parent(uiContainer);
    col1.style('display', 'flex').style('flex-direction', 'column');
    p.createDiv('平滑化 (Lerp)').parent(col1);
    lerpSlider = p.createSlider(0.01, 1.0, 0.1, 0.01).parent(col1);

    // 戻るまでの時間
    const col2 = p.createDiv().parent(uiContainer);
    col2.style('display', 'flex').style('flex-direction', 'column');
    p.createDiv('正面に戻る時間 (ms)').parent(col2);
    returnDelaySlider = p.createSlider(0, 5000, 2000, 100).parent(col2);

    // 気づくまでの間
    const col3 = p.createDiv().parent(uiContainer);
    col3.style('display', 'flex').style('flex-direction', 'column');
    p.createDiv('気づく間 (ms)').parent(col3);
    reactionDelaySlider = p.createSlider(0, 2000, 500, 50).parent(col3);
  }

  p.draw = () => {
    p.background(40, 120, 160);

    if (!capture.loadedmetadata) return;

    // 1. 見る（顔の検出と映像の描画）
    const targetFace = detectFace();

    // 2. 角度を決める（目標角度の計算と平滑化）
    updateBehavior(targetFace);

    // 3. 描く（仮想の首とUI情報）
    drawVirtualHead();
    drawFaceCenterLabel();

    // 4. 送信する（今回はConsoleに表示するだけ）
    sendAngle(headAngle);
  };

  function detectFace() {
    // MediaPipe の準備が終わる前は検出をスキップし、空の結果として扱う
    const detections = faceDetector
      ? faceDetector.detectForVideo(capture.elt, performance.now()).detections
      : [];

    const targetFace = selectTargetFace(detections);

    p.push();
    // 映像を鏡のように左右反転する
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(capture, 0, 0, p.width, p.height);

    // 検出されたすべての顔に四角を描く（反転座標系の中）
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

    return targetFace;
  }

  function updateBehavior(targetFace) {
    if (targetFace) {
      // 顔の位置（0〜1）を計算する
      targetX = toScreenNormalizedCenterX(targetFace.boundingBox, capture.elt.videoWidth);

      if (!isFacePresent) {
        // 顔を新しく発見した瞬間
        firstSeenAt = p.millis();
        isFacePresent = true;
      }
      lastSeenAt = p.millis();

      // スライダーで設定した「気づくまでの間」が経過したら目標角度を更新する
      if (p.millis() - firstSeenAt > reactionDelaySlider.value()) {
        targetAngle = p.map(targetX, 0, 1, 30, 150);
      }
    } else {
      targetX = null;
      isFacePresent = false;
      // スライダーで設定した「戻るまでの時間」が経過したら正面を向く
      if (p.millis() - lastSeenAt > returnDelaySlider.value()) {
        targetAngle = 90;
      }
    }

    // 常に、現在の角度から目標の角度へスライダーの強さで近づける（平滑化）
    headAngle = p.lerp(headAngle, targetAngle, lerpSlider.value());
  }

  function drawVirtualHead() {
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
  }

  function drawFaceCenterLabel() {
    const label = targetX !== null ? `faceX: ${targetX.toFixed(2)}` : "誰もいない";

    // 顔の位置テキスト
    p.noStroke();
    p.fill(0, 0, 0, 160);
    p.rect(10, 10, 150, 36, 6);
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(label, 20, 28);

    // スライダーの現在の値
    p.fill(0, 0, 0, 160);
    p.rect(10, 56, 250, 90, 6);
    p.fill(255);
    p.textSize(14);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`平滑化 (Lerp): ${lerpSlider.value()}`, 20, 66);
    p.text(`戻る時間 (Return): ${returnDelaySlider.value()} ms`, 20, 91);
    p.text(`気づく間 (Reaction): ${reactionDelaySlider.value()} ms`, 20, 116);
  }

  function sendAngle(angle) {
    // 角度を整数に丸める
    const roundedAngle = Math.round(angle);
    
    // 前回送信した値と同じなら何もせずに終了（無駄な送信を省く）
    if (roundedAngle === lastSentAngle) return;

    // TODO: ここにWebSocketで送信する処理を書く
    console.log(`Sending angle: ${roundedAngle}`);

    // 今回送信した値を記録しておく
    lastSentAngle = roundedAngle;
  }
};

// p5.js のインスタンスを生成して起動
new p5(sketch);
