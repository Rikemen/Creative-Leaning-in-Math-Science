# 同梱ライブラリ

- p5.js 2.2.2 (`p5-2.2.2.min.js`)
- 取得元：https://cdn.jsdelivr.net/npm/p5@2.2.2/lib/p5.min.js
- 公式：https://p5js.org/
- LGPL-2.1。配布パッケージの `license.txt` を `p5-LICENSE.txt` として同梱。元ファイルは改変しない。

Loop 07ではp5のインスタンスモードで仮背景・仮ビームを描画する。p5は外部CDNへ接続せず同梱ファイルを読み込む。

Loop 08のml5.jsは同梱せず、`input/body-pose.js` から `https://unpkg.com/ml5@1.3.0/dist/ml5.min.js` をカメラ操作時のみ読み込む。モデルはMoveNet SINGLEPOSE_LIGHTNING。p5 2系向けの非同期コンストラクターを使用する。取得元パッケージのBodyPose実装で `detect(video)` と内部TFJS検出器の `model.dispose()` を確認した。単発の非同期検出を直列に繰り返し、停止後は次の推論を開始せず、実行中の推論完了後にモデルを破棄する。ライブラリのライセンスは [ml5.js License](https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md)、API方式の根拠は [公式p5 2対応説明](https://ml5js.org/blog/using-ml5-with-p5-2/)。検証範囲は `docs/loop08-verification.md` を参照。
