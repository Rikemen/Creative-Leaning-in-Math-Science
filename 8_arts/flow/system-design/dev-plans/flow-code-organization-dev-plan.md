# Flowコード分割・設定集約 開発計画

| Loop | Task | User-facing summary | Unit test | Refactor checkpoint |
| --- | --- | --- | --- | --- |
| 0 | 現状の動作を記録 | 分割前の見た目とFPSを基準として残します。 | `node --check sketch.js` | 既存ファイルを変更しない |
| 1 | ノイズ係数の不整合を直す | 設定済みのノイズ係数が流れへ反映されるようにします。 | 構文確認＋方向線の目視 | 挙動修正を構造変更と分離する |
| 2 | 設定値を集約 | 調整する数値や色を1つの設定ファイルへまとめます。 | 構文確認＋表示比較 | 実行中の状態を設定へ入れない |
| 3 | Particleを分離 | 粒子の責務を専用ファイルへ移します。 | 構文確認＋粒子動作確認 | 必要な設定だけを受け取る |
| 4 | FlowFieldを分離 | 流れ場の生成と参照を専用ファイルへ移します。 | 構文確認＋流れ表示確認 | p5の描画ループを持ち込まない |
| 5 | sketchを整理 | `sketch.js`を全体の進行管理だけに絞ります。 | 構文確認＋リサイズ確認 | 読み込み順を明示する |
| 6 | 回帰確認 | 分割前と同じ見た目・操作・性能か確認します。 | ブラウザ結合確認 | 不要な抽象化を追加しない |

## ゴール / スコープ

現在1ファイルにある設定、`Particle`、`FlowField`、p5.jsのライフサイクル処理を次の構成へ分ける。

```text
flow/
├── index.html
├── src/
│   ├── config.js
│   ├── Particle.js
│   ├── FlowField.js
│   └── sketch.js
├── dev-plan.md
├── dev-log.md
└── proposal.md
```

`src/sketch.js`には、次だけを残す。

- `particles`、`flowField`などの実行中の状態
- `setup()`
- `draw()`
- `drawFps()`
- `windowResized()`
- クラスの生成と処理順の制御

今回はES Modules、ビルドツール、テストフレームワークの導入は行わない。p5.jsのGlobal Modeを維持し、通常の`script`タグで読み込む。

## 設定ファイルへ入れるもの

`src/config.js`には、作品を調整するときに変更する固定値を入れる。

```js
const CONFIG = {
    canvas: {
        pixelDensity: 1,
        targetFps: 60,
        backgroundColor: [0, 0, 0]
    },
    particle: {
        count: 50000,
        color: [255, 255, 255, 175],
        gravity: 0.03,
        size: 3,
        resetMargin: 20,
        maxSpeed: 8,
        initialSpeedMin: 0.5,
        initialSpeedMax: 2
    },
    flowField: {
        cellSize: 40,
        noiseScale: 0.08,
        timeSpeed: 0.003,
        strength: 0.04,
        angleSpread: Math.PI / 3
    },
    debug: {
        showFps: true,
        showFlowField: true,
        flowColor: [0, 255, 100, 120],
        flowLineLengthRatio: 0.4
    }
};
```

次の実行中データは設定ファイルへ入れない。

- `particles`配列
- `flowField`インスタンス
- 粒子の`pos`、`vel`、`acc`
- Flow Fieldの`vectors`、`cols`、`rows`、`time`
- `width`、`height`、`frameCount`

これらは実行中に変化する「状態」であり、初期設定とは役割が異なる。

## 前提とリスク

- 現在は自動テスト環境がないため、各Loopでは`node --check`による構文確認とブラウザでの回帰確認を行う。
- `setup()`と`draw()`はp5.jsから見えるグローバル関数である必要がある。現段階では`type="module"`へ変更しない。
- `index.html`のスクリプト読み込み順が依存関係になる。p5.js、設定、クラス、`sketch.js`の順を守る。
- 現在の`FlowField.update()`は`FLOW_NOISE_SCALE`ではなく`FLOW_CELL_SIZE`をノイズ座標に使用している。これは構造変更とは別の挙動修正として先に扱う。
- 既存の未コミット変更があるため、リファクタリング時に`sketch.js`や`dev-plan.md`を上書きしない。
- 50,000粒子とデバッグ表示を同時に動かすため、分割前後のFPSを記録して性能低下を確認する。

## 詳細Loop

### Loop 0：分割前の基準を記録する

**Objective**

リファクタリングによって見た目や性能が変化していないか比較できる状態にする。

**Test first**

- `node --check sketch.js`を実行する。
- ブラウザで粒子、Flow Fieldの方向線、FPS、リサイズ動作を確認する。
- 通常時のおおよそのFPSをメモする。

**Minimal steps**

- ファイルは変更しない。
- 必要ならスクリーンショットを1枚残す。

**Completion criteria**

- 分割後と比較する見た目とFPSが分かる。

### Loop 1：ノイズ係数の不整合を独立して直す

**Objective**

設定されている`FLOW_NOISE_SCALE`を実際のノイズ座標へ適用する。

**Test first**

- `SHOW_FLOW_FIELD`を有効にし、隣接する方向線が滑らかにつながるか確認する。
- 現状の`col * FLOW_CELL_SIZE`と`row * FLOW_CELL_SIZE`が意図した設定を参照していないことを確認する。

**Minimal implementation**

- ノイズ座標を`col * FLOW_NOISE_SCALE`、`row * FLOW_NOISE_SCALE`へ変更する。
- クラス分割や名前変更は同時に行わない。

**Verification**

```bash
node --check sketch.js
```

**Refactor checkpoint**

- このLoopは`fix(flow)`として構造変更から分離できる状態にする。

**Completion criteria**

- 隣接格子の方向が連続的になり、粒子が細かく乱れるのではなく滑らかに蛇行する。

### Loop 2：設定値を`src/config.js`へ集約する

**Objective**

見た目・物理・デバッグ用の調整値を1か所から変更できるようにする。

**Test first**

- 分割前の背景色、粒子数、重力、Flow Field表示状態を記録する。
- `src/config.js`追加後も同じ値で起動することを確認対象にする。

**Minimal implementation**

- `src/config.js`を作成し、`canvas`、`particle`、`flowField`、`debug`へ分類する。
- `index.html`でp5.jsの直後に`src/config.js`を読み込む。
- `sketch.js`の固定値参照を`CONFIG`参照へ置き換える。
- `particles`や`flowField`などの実行中状態は`sketch.js`に残す。

**Verification**

```bash
node --check src/config.js
node --check sketch.js
```

**Refactor checkpoint**

- 計算途中の値やクラス内部だけで使う一時値を設定ファイルへ出していないか確認する。
- `CONFIG`を実行中に書き換える処理を作らない。

**Completion criteria**

- 作品の主要パラメーターが`src/config.js`だけで把握できる。
- 分割前と同じ見た目で動作する。

### Loop 3：`Particle`クラスを分離する

**Objective**

粒子1個の状態と動作を`src/Particle.js`へ移す。

**Test first**

- 粒子が重力で落下することを確認する。
- 左右の画面端でラップし、下端で上部へ戻ることを確認する。

**Minimal implementation**

- `Particle`クラスだけを`src/Particle.js`へ移動する。
- コンストラクターで`particleConfig`を受け取り、`this.config`へ保存する。
- `new Particle(CONFIG.particle)`として生成する。
- `index.html`で`src/Particle.js`を`sketch.js`より前に読み込む。

**Verification**

```bash
node --check src/Particle.js
node --check sketch.js
```

**Refactor checkpoint**

- `Particle`が`CONFIG`全体へ直接依存せず、必要な`particle`設定だけを受け取る。
- `Particle`へ`setup()`や`draw()`を移さない。

**Completion criteria**

- `sketch.js`から`Particle`クラス定義が消える。
- 粒子の見た目と動きが分割前と同じである。

### Loop 4：`FlowField`クラスを分離する

**Objective**

格子、ノイズ方向、検索、デバッグ表示を`src/FlowField.js`へ移す。

**Test first**

- デバッグ方向線が時間変化することを確認する。
- 粒子が現在位置の流れを参照して蛇行することを確認する。

**Minimal implementation**

- `FlowField`クラスだけを`src/FlowField.js`へ移動する。
- コンストラクターで`flowFieldConfig`と必要なデバッグ設定を受け取る。
- `new FlowField(CONFIG.flowField, CONFIG.debug)`として生成する。
- `index.html`で`src/FlowField.js`を`sketch.js`より前に読み込む。

**Verification**

```bash
node --check src/FlowField.js
node --check sketch.js
```

**Refactor checkpoint**

- `FlowField`は格子の生成・更新・検索・表示だけを担当する。
- 粒子配列のループやFPS表示を持たせない。

**Completion criteria**

- `sketch.js`から`FlowField`クラス定義が消える。
- Flow Fieldの方向と粒子の蛇行が分割前と同じである。

### Loop 5：`sketch.js`を進行管理へ限定する

**Objective**

p5.jsのライフサイクルとクラス間の接続だけを残す。

**Test first**

- `setup()`、`draw()`、`windowResized()`が呼ばれていることをブラウザで確認する。
- FPS表示が粒子の上に表示されることを確認する。

**Minimal implementation**

- `sketch.js`を`src/sketch.js`へ移す。
- `index.html`の読み込み順を次へ変更する。

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.js"></script>
<script src="src/config.js"></script>
<script src="src/Particle.js"></script>
<script src="src/FlowField.js"></script>
<script src="src/sketch.js"></script>
```

- `drawFps()`は現状の規模ではクラス化せず、`src/sketch.js`に残す。
- `frameRate(CONFIG.canvas.targetFps)`が必要なら`setup()`で適用する。

**Verification**

```bash
node --check src/config.js
node --check src/Particle.js
node --check src/FlowField.js
node --check src/sketch.js
```

**Refactor checkpoint**

- `src/sketch.js`が「何を、どの順序で動かすか」を読むだけで把握できるか確認する。
- 1関数しか持たないFPS専用クラスなど、現時点で不要な抽象化を作らない。

**Completion criteria**

- `src/sketch.js`にクラス定義と大量の固定値が残っていない。
- ウィンドウリサイズ後もFlow Fieldの格子が再生成される。

### Loop 6：分割後の回帰確認

**Objective**

ファイル構成だけが変わり、作品の動作が壊れていないことを確認する。

**Test first / Verification**

- ブラウザコンソールに`ReferenceError`や読み込みエラーがない。
- 粒子が落下し、Flow Fieldに沿って蛇行する。
- 下端リセットと左右ラップが動作する。
- Flow Field表示とFPS表示を設定で切り替えられる。
- ウィンドウリサイズ後も全画面表示される。
- 分割前と比べてFPSが大幅に低下していない。

**Refactor checkpoint**

- クラス間で共有する可変グローバル状態を増やしていない。
- 同じ設定値を複数ファイルへ重複させていない。
- 不要になった元の`sketch.js`や古い定数定義が残っていない。

**Completion criteria**

- 主要動作がすべて維持され、各クラスと設定の責務がファイル単位で分かれている。

## 検証戦略

現在はテストフレームワークがないため、次の2段階で確認する。

1. 各Loopで`node --check`を実行し、JavaScriptの構文エラーを検出する。
2. ブラウザでp5.jsのGlobal Mode、スクリプト読み込み順、描画、リサイズ、FPSを結合確認する。

将来、物理計算や格子インデックス計算を自動テストしたくなった段階で、p5.js依存のない純粋関数を別途切り出し、テスト環境を導入する。今回の構造分割と同時には行わない。

## ロールバック / フォローアップ

- 各Loopを個別コミットにし、問題があれば直前の構成へ戻せるようにする。
- 挙動修正のLoop 1と、構造変更のLoop 2以降を同じコミットへ混ぜない。
- `DebugOverlay`、`ParticleSystem`、サブフォルダ分割は、泡・飛沫・障害物などのクラスが増えてから検討する。
- ES ModulesやViteへの移行は、依存管理や自動テストが必要になった時点で別計画として扱う。
