# テストの配置

## Loop 26〜29の実行

```bash
npm test
npm run test:e2e
npm run test:performance
```

E2Eは24シナリオ（うちカメラモードの1件は実時間60秒）、性能確認は実時間60秒×3回。どちらも一時HTTPサーバーとChromeを自動で起動・終了する。既存の5100番サーバーは使用しない。結果は `docs/loop28-e2e-results.json`、`docs/loop29-performance.json`、画面は `docs/loop27-*.png` と `docs/loop29-round-*.png` に保存する。

ブラウザ検証にはインストール済みのGoogle ChromeとPlaywrightが必要。ローダーは `PLAYWRIGHT_MODULE`、ローカルの `playwright`、Codex同梱ランタイムの順で探す。この作業環境では既存のPlaywright 1.62.1を使用した。npmの依存追加は自動承認レビューに拒否され、package依存は変更していない。別環境で導入する場合のコマンドは次のとおり。

```bash
npm install --save-dev --save-exact playwright@1.62.1 --ignore-scripts
```

既存モジュールを指定する場合は `PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run test:e2e`。OSのサンドボックスがChrome起動を制限する環境では、許可された実行環境が必要。

時計・カメラ・姿勢のモックは `tests/e2e/` 内でのみ注入し、配信コードにテスト用分岐は追加しない。タッチはChromeのCDPによる入力で、物理端末の指操作ではない。性能確認は時計を置換せず、カメラを使わず、実音源を有効にして計測する。キーボード→表示の時間を身体認識の遅延として扱わない。[検証範囲](../docs/loop26-29-verification.md)を参照。

- `unit/`：ゲームの純粋ロジック、入力、表示状態の単体テスト。
- `firebase/`：Auth状態、Rules、Functionsの所有者・冪等性・競合の検証。
- `e2e/`：ブラウザで開始から結果までの操作検証。
- `fixtures/`：架空の入力・問題・姿勢・API結果。

Node組み込みテストを導入済み。`npm test` で `unit/*.test.js` の91テストを実行する。単体テストには外部依存の追加は不要。個別実行例は `node --test tests/unit/pause.test.js`。`test:firebase` は未導入。

ロードマップの `tests/<name>.test.js` は計画時の仮パス。本構成では通常の単体テストを `tests/unit/<name>.test.js` に配置し、対象コマンドも合わせて更新する。カメラ映像や個人情報をfixtureとして保存しない。

## 旧UIの検証履歴

以下のLoop 09〜25の個別ブラウザスクリプトとコマンドは、その当時の交差判定・準備画面を対象とした記録です。現在の2モードUI・手首間距離判定の検証には使用せず、冒頭の `npm run test:e2e` を使ってください。単体テストの個別実行は引き続き利用できます。

Loop 09のブラウザ検証は `tests/browser/pose-preview.cjs`。PlaywrightとChromeが利用可能な環境で、ローカルサーバー起動後に `node tests/browser/pose-preview.cjs` を実行する。Playwrightを同梱ランタイムから使う場合は第1引数にそのモジュールの絶対パスを渡す。新たな依存インストールは行っていない。合成映像と模擬姿勢のみを使用し、人物映像を保存しない。詳細は [Loop 09](../docs/loop09-verification.md)。

Loop 10は `node --test tests/unit/aim.test.js`。ブラウザ検証はLoop 09と同じ合成カメラを利用し、`node tests/browser/pose-preview.cjs <Playwrightのモジュールパス> --aim` を実行する。中央校正、腕を組んだ模擬姿勢で4枚へ到達、範囲変更、喪失・鮮度切れ、ゲーム状態の保持を確認する。詳細は [Loop 10](../docs/loop10-verification.md)。

Loop 11は `node --test tests/unit/gesture.test.js`。ブラウザ検証は `node tests/browser/pose-preview.cjs <Playwrightのモジュールパス> --gesture`。詳細は [Loop 11](../docs/loop11-verification.md)。

Loop 12は `node --test tests/unit/recovery.test.js`。ブラウザ検証は `node tests/browser/pose-preview.cjs <Playwrightのモジュールパス> --recovery`。詳細は [Loop 12](../docs/loop12-verification.md)。

Loop 14は `node --test tests/unit/layout.test.js`。ローカルサーバー起動後に `node tests/browser/layout-check.cjs <Playwrightのモジュールパス>` で6画面サイズの配置・数字の安全領域・誤答・加点・停止画面・リサイズ後の操作を確認。詳細は [Loop 14](../docs/loop14-verification.md)。

Loop 20は `node --test tests/unit/assets.test.js`。ブラウザ検証は `node tests/browser/assets-check.cjs <Playwrightのモジュールパス>`（一時サーバーを自動起動・終了）。4幅の姿勢切替、4画像の個別欠損、合成範囲を検証する。書き出しの再現は `node assets-source/images/export-hero.cjs <Playwrightのモジュールパス>`。詳細は [検証記録](../docs/loop20-verification.md)。

Loop 21〜25は `effects.test.js`、`feedback.test.js`、`audio.test.js`、`screens.test.js`（tests/unit/）。ブラウザは `node tests/browser/loop25-check.cjs <Playwrightのモジュールパス>`。一時サーバーを自動で起動・終了し、練習・演出・再生・消音・音源欠損・結果と再挑戦を検証する。

2モード追加後の検証は [操作モード検証](../docs/input-modes-verification.md)。Loop28のJSONには既存6シナリオ、追加したカメラ60秒シナリオの成否はコマンドのTAP結果に出力する。

起動キャッシュ・モジュール失敗表示は `node --test tests/e2e/startup.test.cjs`。

骨格モニターの配置と、非表示中も認識で加点できることは `node --test tests/e2e/camera-monitor.test.cjs`。

16:9のテレビ・PC画面3解像度は `node --test tests/e2e/tv-layout.test.cjs`。専用設定画面、プレイ、骨格表示切替について、スクロール・重なり・44px以上の操作領域を検証する。画面は `docs/tv-camera-setup-*.png` と `docs/tv-camera-play-*.png` に保存する。

専用設定画面の開始・練習・途中再設定は `node --test tests/e2e/camera-settings.test.cjs`。設定中の時間停止、明示的な開始、動画と同じ接続の継続、途中再開時の問題・HP・得点保持、範囲変更時の再登録、手首が一時的に見えなくてもゲームへ進み認識後に開始できることを検証する。[カメラ設定画面の検証記録](../docs/camera-settings-verification.md)を参照。

手首判定の感度・認識状態の表示・短い欠損からの復帰は `node --test tests/e2e/gesture-stability.test.cjs`。感度がゲームへ反映されること、欠損中にダメージが入らないこと、短い欠損では同じ問題へ再発射でき、長い欠損では離し直す必要があることを検証する。[手首判定の検証記録](../docs/gesture-stability-verification.md)を参照。

ビームの実音源デコード・発射と持続の再生・停止・消音・模擬カメラ・素材プレビューは `node --test tests/e2e/beam-audio.test.cjs`。[ビーム効果音の検証記録](../docs/beam-audio-verification.md)を参照。
