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

// p5.js を Instance Mode で定義
const sketch = (p) => {
  let capture;

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // カメラ映像の取得を開始
    capture = p.createCapture(p.VIDEO);
    capture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    // HTML上のvideo要素は非表示にし、p5.jsのキャンバス上だけに描画する
    capture.hide();
  };

  p.draw = () => {
    p.background(40, 120, 160);
    
    // カメラ映像が準備できていればキャンバスに描画
    if (capture.loadedmetadata) {
      p.push();
      // 映像を鏡のように左右反転する
      p.translate(p.width, 0);
      p.scale(-1, 1);
      p.image(capture, 0, 0, p.width, p.height);

      // MediaPipe の準備が終わっていれば顔を検出する
      if (faceDetector) {
        // capture.elt は裏側に隠れている本来の <video> 要素
        const results = faceDetector.detectForVideo(capture.elt, performance.now());
        
        // 検出されたすべての顔に四角を描く
        if (results.detections) {
          for (let i = 0; i < results.detections.length; i++) {
            const face = results.detections[i];
            const box = face.boundingBox;
            
            p.noFill();
            p.stroke(0, 255, 0); // 緑色
            p.strokeWeight(4);
            p.rect(box.originX, box.originY, box.width, box.height);
          }
        }
      }
      p.pop();
    }
  };
};

// p5.js のインスタンスを生成して起動
new p5(sketch);
