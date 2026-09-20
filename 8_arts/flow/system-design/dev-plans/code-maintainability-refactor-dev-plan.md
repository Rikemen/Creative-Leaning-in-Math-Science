# 認知負荷低減・保守性向上 リファクタリング計画

| Loop | Task | User-facing summary | Unit test | Refactor checkpoint |
| --- | --- | --- | --- | --- |
| 0 | 現在の動作を固定 | リファクタリング前の見た目・FPS・操作を記録します。 | 全JSの構文確認 | ソースを変更しない |
| 1 | 責務と命名規則を定義 | 各ファイルが担当する仕事とJSDoc規則を決めます。 | 文書レビュー | 役割を重複させない |
| 2 | 型定義を追加 | 衝突結果や設定値の形をJSDocで明確にします。 | IDE表示確認 | 実行コードを変えない |
| 3 | DebugOverlayを分離 | FPSなどのデバッグ描画を`sketch.js`から移します。 | 構文＋表示確認 | デバッグ処理だけを移す |
| 4 | SplashSystemを分離 | 飛沫の生成・更新・削除を1か所へまとめます。 | 飛沫の目視確認 | 配列の所有者を1つにする |
| 5 | 衝突計算を純粋関数化 | 法線・接線計算を描画や粒子から切り離します。 | 代表値の計算確認 | グローバル状態を参照しない |
| 6 | CollisionSystemを追加 | 障害物の生成・判定・描画・リサイズを集約します。 | 衝突の目視確認 | `Obstacle`を配列管理から切り離す |
| 7 | WaterSimulationを追加 | 作品全体の状態と処理順を専用クラスへ移します。 | 起動確認 | p5ライフサイクルを残す |
| 8 | 粒子更新を関数分割 | 主流・表面流・泡の処理を短い関数へ分けます。 | 見た目比較 | 1関数1段階にする |
| 9 | sketchを最小化 | `setup`・`draw`・`windowResized`だけに近づけます。 | リサイズ確認 | 作品ロジックを置かない |
| 10 | フォルダを整理 | entity・physics・rendering・systemを見つけやすくします。 | 読み込み確認 | 移動と挙動変更を混ぜない |
| 11 | JSDocとコメントを整備 | 公開関数の入力・出力・副作用を統一して記述します。 | IDEホバー確認 | 自明なコメントを増やさない |
| 12 | 不要コードと表記を整理 | 古いコメント、重複処理、表記ゆれを除去します。 | 構文＋差分確認 | 挙動を変更しない |
| 13 | 回帰・性能確認 | 分割前と同じ動作とFPSを維持できたか確認します。 | ブラウザ結合確認 | 問題を1種類ずつ切り分ける |

## ゴール / スコープ

現在の水流表現を変えず、コードを読む人が次の質問へすぐ答えられる構造にする。

- 作品全体の処理順はどこにあるか。
- 粒子の物理更新はどこにあるか。
- 衝突計算はどこにあるか。
- 飛沫を生成・削除するのは誰か。
- 描画レイヤーを管理するのは誰か。
- FPSやデバッグ表示はどこにあるか。
- 調整可能な値はどこにあるか。
- 関数の引数、戻り値、副作用は何か。

対象は次のとおり。

- `sketch.js`の責務分割
- 衝突・飛沫・デバッグ処理のSystem化
- 純粋な計算処理のutility化
- JSDocによる型・引数・戻り値・副作用の明示
- ファイルとフォルダ構成の整理
- 古いコメント、重複、表記ゆれの整理
- 構文確認とブラウザ回帰確認の手順統一

対象外は次のとおり。

- 見た目、物理パラメーター、粒子数の意図的な変更
- 新しい水流機能や障害物形状の追加
- p5.js Global ModeからInstance Modeへの移行
- ES Modules、Vite、TypeScriptへの移行
- GPU化やシェーダー最適化
- ブラーや粒子描画の性能改善

## 現状分析

現在の`src`は合計1,023行である。

| File | Lines | 主な責務 |
| --- | ---: | --- |
| `src/sketch.js` | 253 | 初期化、更新、衝突、飛沫、描画、FPS、リサイズ |
| `src/Obstacle.js` | 151 | 矩形、衝突面判定、位置補正、速度応答 |
| `src/Particle.js` | 143 | 状態、物理、寿命、描画、衝突補助 |
| `src/config.js` | 134 | 全設定値 |
| `src/FlowField.js` | 126 | Curl Noise、検索、デバッグ描画 |
| `src/WaterLayers.js` | 90 | 描画レイヤー、発光、合成 |
| `src/SplashParticle.js` | 79 | 飛沫の状態、物理、描画 |
| `src/FoamParticle.js` | 47 | 泡の描画と衝突半径 |

現在の主な認知負荷は次のとおり。

1. `sketch.js`が複数種類の状態と処理を同時に所有している。
2. `updateWaterParticles()`が物理、衝突、リセット、描画、飛沫生成を同時に行う。
3. 飛沫生成コードが画面下端と障害物衝突に分散している。
4. `Obstacle.resolveCollision()`が判定、法線決定、位置補正、速度変換を1メソッドで行う。
5. 公開メソッドの引数・戻り値・副作用がコードを読まないと分からない。
6. コメント量にばらつきがあり、JSDocと通常コメントの役割が分かれていない。
7. `index.html`の読み込み順が依存関係を暗黙的に決めている。
8. `FoamParticle`と`Particle`で衝突半径の判断が分散している。

## 目標構成

```text
src/
├── config.js
├── types.js
├── sketch.js
├── simulation/
│   └── WaterSimulation.js
├── systems/
│   ├── CollisionSystem.js
│   └── SplashSystem.js
├── particles/
│   ├── Particle.js
│   ├── FoamParticle.js
│   └── SplashParticle.js
├── physics/
│   ├── FlowField.js
│   └── Obstacle.js
├── rendering/
│   ├── WaterLayers.js
│   └── DebugOverlay.js
└── utils/
    └── collisionMath.js
```

フォルダを細かくしすぎないため、utilityはまず`collisionMath.js`だけにする。`math.js`や`helpers.js`のような用途不明のファイルは作らない。

## 責務の決定

| Component | 責務 | 持たせない責務 |
| --- | --- | --- |
| `sketch.js` | p5.jsの`setup`、`draw`、`windowResized` | 粒子配列、衝突、飛沫生成 |
| `WaterSimulation` | 作品全体の生成、更新順、描画順、リサイズ | 衝突計算の数式 |
| `CollisionSystem` | 障害物配列、全障害物との判定、表示、リサイズ | 飛沫配列の直接操作 |
| `SplashSystem` | 飛沫配列、生成、更新、削除、描画 | 障害物判定 |
| `Particle` | 1粒子の状態、物理、寿命、線描画 | 全粒子配列の操作 |
| `Obstacle` | 1矩形の形状と1粒子への衝突適用 | 全障害物のループ |
| `FlowField` | 流れベクトルの生成と検索 | 粒子配列の更新 |
| `WaterLayers` | p5.Graphicsの生成、クリア、発光、合成 | 粒子物理 |
| `DebugOverlay` | FPSとデバッグ描画 | シミュレーション更新 |
| `collisionMath` | 法線、接線、速度分解などの純粋計算 | p5描画、配列変更、CONFIG参照 |

## Utilityへ切り出す基準

次をすべて満たす処理だけを`utils/`へ置く。

- 入力だけで結果が決まる。
- グローバル配列や`CONFIG`を直接参照しない。
- p5.jsの描画状態を変更しない。
- 粒子や障害物を直接書き換えず、計算結果を返せる。
- 名前だけで用途が分かる。

次はutilityにしない。

- `updateWaterParticles()`：作品固有の進行処理なので`WaterSimulation`へ置く。
- `spawnCollisionSplashes()`：飛沫固有なので`SplashSystem`へ置く。
- `drawFps()`：描画責務なので`DebugOverlay`へ置く。
- `createParticleGroups()`：初期化責務なので`WaterSimulation`へ置く。

候補となる純粋関数は次のとおり。

```js
findNearestRectangleSide(position, bounds)
calculateImpactSpeed(velocity, normal)
calculateTangentVelocity(velocity, normal, options)
```

## JSDoc規則

JSDocは「コードを読まずに使い方が分かること」を目的とする。

### 必須対象

- クラス
- コンストラクター
- 他ファイルから呼ばれるpublicメソッド
- 戻り値を持つ関数
- 引数の単位や意味が名前だけでは分からない関数
- 粒子や配列を書き換える副作用を持つ関数

### 書かない対象

- 変数名をそのまま日本語にしただけの説明
- `i++`や`return null`など自明な処理
- 実装手順を1行ずつ説明するコメント
- 実際の挙動と同期しづらい長い背景説明

### 記述例

```js
/**
 * 粒子と矩形の衝突を解決し、粒子の位置と速度を変更する。
 *
 * @param {Particle} particle 衝突判定する粒子。
 * @returns {CollisionResult|null} 衝突情報。衝突しない場合は`null`。
 * @sideEffect `particle.pos`と`particle.vel`を更新する。
 */
resolveCollision(particle) {
    // ...
}
```

標準JSDocに`@sideEffect`は正式タグではないため、ツール互換性を優先する場合は本文へ副作用を書く。

```js
/**
 * すべての飛沫を更新し、寿命切れの要素を配列から削除する。
 * このメソッドは内部の飛沫配列を変更する。
 *
 * @param {FlowField} flowField 現在の流れ場。
 * @param {p5.Graphics} target 飛沫の描画先。
 * @returns {void}
 */
update(flowField, target) {
    // ...
}
```

単位も可能な限り書く。

```js
/**
 * @param {number} frames クールダウン時間。単位はフレーム。
 */
startCollisionCooldown(frames) {
    // ...
}
```

## 前提とリスク

- 現在のブランチは`dev`である。
- 既存の未コミット変更があるため、実装時は現在の差分を各Loopの開始前に確認する。
- 自動テスト環境はない。各Loopでは構文確認とブラウザ回帰確認を行う。
- Global Modeを維持するため、`index.html`のスクリプト読み込み順が引き続き重要になる。
- ファイル移動とロジック変更を同じLoopで行うと原因切り分けが難しくなる。
- 12,000以上の粒子を毎フレーム処理するため、hot pathでオブジェクトを大量生成するutilityは作らない。
- `Particle.display()`の速度・透明度計算は毎粒子・毎フレーム呼ばれるため、可読性だけを理由に戻り値オブジェクトへまとめない。
- `Obstacle.resolveCollision()`の純粋計算分離では、乱数をutility内部で呼ばず、必要な方向値を引数として渡す。

## 詳細Loop

### Loop 0：リファクタリング前の基準を残す

**Objective**

構造変更後に見た目・衝突・FPSが変わっていないか比較できる状態にする。

**Test first**

```bash
node --check src/config.js
node --check src/Particle.js
node --check src/FoamParticle.js
node --check src/SplashParticle.js
node --check src/FlowField.js
node --check src/Obstacle.js
node --check src/WaterLayers.js
node --check src/sketch.js
```

**Minimal steps**

- 通常表示のスクリーンショットを1枚残す。
- 通常時のおおよそのFPSを記録する。
- 主流、表面流、泡、飛沫、障害物、リサイズを確認する。

**Refactor checkpoint**

- ソースファイルを変更しない。

**Completion criteria**

- 分割後と比較できる見た目とFPSが記録されている。

### Loop 1：責務・命名・JSDoc規則を固定する

**Objective**

実装中にファイルの役割が再び曖昧になることを防ぐ。

**Test first**

- 目標構成の各ファイルについて「入力・出力・所有する状態」を1文で説明できるか確認する。

**Minimal implementation**

- この計画書の「責務の決定」と「JSDoc規則」を実装チェックリストとして使う。
- 関数名は動詞から始める。
- 真偽値は`is`、`has`、`can`、`should`から始める。
- 単位がある値はJSDocまたは設定コメントで明記する。

**Verification**

- 新しいクラス・関数名だけを一覧にして、役割が重複していないか確認する。

**Refactor checkpoint**

- `Manager`、`Helper`、`Utils`など役割が曖昧な命名を避ける。

**Completion criteria**

- 以降のLoopで迷ったときの配置基準が決まっている。

### Loop 2：JSDoc型定義を追加する

**Objective**

設定、衝突結果、座標の形をIDE上で確認できるようにする。

**Test first**

- 現在、`collision.normalX`や`style.lifeMin`へカーソルを合わせても型情報が十分に出ないことを確認する。

**Minimal implementation**

- `src/types.js`を追加する。
- 最初は`CollisionResult`、`Vector2`、`ParticleStyle`だけを定義する。
- 実行処理は入れない。

```js
/**
 * @typedef {Object} CollisionResult
 * @property {number} x 衝突点のX座標（px）。
 * @property {number} y 衝突点のY座標（px）。
 * @property {number} normalX 外向き法線のX成分。
 * @property {number} normalY 外向き法線のY成分。
 * @property {number} impactSpeed 法線方向の衝突速度（px/frame）。
 */

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */
```

**Verification**

- IDEのホバー表示で`CollisionResult`のプロパティ説明を確認する。

**Refactor checkpoint**

- すべてのCONFIG項目を一度に型定義しない。

**Completion criteria**

- 複数ファイルで使う重要なデータ形状が明文化されている。

### Loop 3：`DebugOverlay`を分離する

**Objective**

FPSとデバッグ表示を作品ロジックから分離する。

**Test first**

- FPS表示の位置、色、値を記録する。

**Minimal implementation**

- `src/rendering/DebugOverlay.js`を追加する。
- 現在の`drawFps()`を`DebugOverlay.displayFps()`へ移す。
- 必要なら`displayFlowField(flowField)`を追加する。
- `sketch.js`から描画詳細を削除し、メソッド呼び出しだけを残す。

**Verification**

```bash
node --check src/rendering/DebugOverlay.js
node --check src/sketch.js
```

**Refactor checkpoint**

- FPSの計算以外のシミュレーション状態を持たせない。
- publicメソッドへJSDocを付ける。

**Completion criteria**

- FPS表示が分割前と同じで、`sketch.js`に描画詳細が残っていない。

### Loop 4：`SplashSystem`を分離する

**Objective**

飛沫配列と、画面下端・衝突位置からの飛沫生成を1か所へ集約する。

**Test first**

- 画面下端と障害物衝突の両方で飛沫が発生することを確認する。
- 寿命切れの飛沫が削除されることを確認する。

**Minimal implementation**

- `src/systems/SplashSystem.js`を追加する。
- `splashParticles`配列を`SplashSystem`だけが所有する。
- 次のpublic APIへ限定する。

```js
emitFromBottom(impact)
emitFromCollision(collision)
update(flowField, target)
clear()
```

- `spawnCollisionSplashes()`と画面下端の生成ループを移す。
- 飛沫を後ろから削除するループも移す。

**Verification**

```bash
node --check src/systems/SplashSystem.js
node --check src/sketch.js
```

**Refactor checkpoint**

- 外部コードが`SplashSystem`内部配列を直接操作しない。
- 生成条件と描画更新を別メソッドへ分ける。
- publicメソッドにJSDocを付ける。

**Completion criteria**

- `sketch.js`から飛沫配列、生成ループ、削除ループが消える。

### Loop 5：衝突計算を純粋関数へ分ける

**Objective**

`Obstacle.resolveCollision()`の数式を、状態変更から切り離して読みやすくする。

**Test first**

- 上・下・左・右の各法線と、代表速度に対する接線速度を記録する。

**Minimal implementation**

- `src/utils/collisionMath.js`を追加する。
- `findNearestRectangleSide()`を抽出する。
- `calculateImpactSpeed()`を抽出する。
- `calculateTangentVelocity()`を抽出する。
- utilityはplain objectとnumberを受け取り、plain objectを返す。
- `CONFIG`、`Particle`、`Obstacle`、p5描画APIを直接参照しない。

**Verification**

```bash
node --check src/utils/collisionMath.js
node --check src/physics/Obstacle.js
```

実装時点では`Obstacle.js`がまだ移動前なら、2番目の対象は`src/Obstacle.js`とする。

**Refactor checkpoint**

- hot pathで不要なp5.Vectorを生成しない。
- fallback方向の乱数は呼び出し側で決め、utilityへ数値として渡す。
- 各関数へ入力・戻り値のJSDocを付ける。

**Completion criteria**

- `Obstacle.resolveCollision()`が「判定結果を受け取り、粒子を補正する」流れで読める。

### Loop 6：`CollisionSystem`を追加する

**Objective**

障害物配列と全障害物へのループを`sketch.js`から分離する。

**Test first**

- 2つの障害物の表示、衝突、リサイズを確認する。

**Minimal implementation**

- `src/systems/CollisionSystem.js`を追加する。
- `obstacles`配列を`CollisionSystem`だけが所有する。
- public APIを次へ限定する。

```js
resolve(particle)
display()
resize()
```

- `resolve(particle)`は`CollisionResult[]`を返す。
- 飛沫を出すかどうかは判断せず、衝突情報だけを返す。

**Verification**

```bash
node --check src/systems/CollisionSystem.js
node --check src/sketch.js
```

**Refactor checkpoint**

- `CollisionSystem`から`SplashSystem`を直接呼ばない。
- 障害物の見た目は`Obstacle.display()`へ残す。
- publicメソッドへJSDocを付ける。

**Completion criteria**

- `sketch.js`から`obstacles`配列と障害物ループが消える。

### Loop 7：`WaterSimulation`を追加する

**Objective**

作品全体の状態と初期化をp5.jsライフサイクルから分離する。

**Test first**

- 初期化直後の主流、表面流、泡の個数を確認する。

**Minimal implementation**

- `src/simulation/WaterSimulation.js`を追加する。
- 次の状態を移す。

```text
mainParticles
surfaceParticles
foamParticles
flowField
waterLayers
collisionSystem
splashSystem
debugOverlay
```

- コンストラクターでは設定を保存し、`initialize()`でp5依存オブジェクトを作る。
- public APIを次へ限定する。

```js
initialize()
updateAndRender()
resize()
```

**Verification**

```bash
node --check src/simulation/WaterSimulation.js
node --check src/sketch.js
```

**Refactor checkpoint**

- constructorで`createGraphics()`を呼ばず、Canvas作成後の`initialize()`で行う。
- 配列生成用のprivate相当メソッドを名前付きで分ける。
- publicメソッドへJSDocを付ける。

**Completion criteria**

- 作品の実行状態が`WaterSimulation`へ集約されている。

### Loop 8：更新処理を短い段階へ分ける

**Objective**

1つの関数内で物理・衝突・飛沫・描画を同時に理解しなくてよい状態にする。

**Test first**

- 主流、表面流、泡が更新される順番を記録する。

**Minimal implementation**

- `WaterSimulation`内に次のメソッドを作る。

```js
updateFlowField()
updateMainParticles()
updateSurfaceParticles()
updateFoamParticles()
updateSplashParticles()
renderLayers()
renderObstacles()
renderDebugOverlay()
```

- 共通処理は`updateParticleGroup(particles, target, options)`へまとめる。
- `options`は必要最小限とし、真偽値が増えすぎた場合は名前付きオブジェクトにする。
- 更新順を`updateAndRender()`で上から読める形にする。

**Verification**

```bash
node --check src/simulation/WaterSimulation.js
```

**Refactor checkpoint**

- 各メソッドは1つの描画段階または1種類の粒子だけを担当する。
- メソッド間で同じ配列を受け渡し続けず、所有状態を明確にする。
- `updateAndRender()`へ細かな数式を置かない。

**Completion criteria**

- 作品の1フレーム処理がメソッド名の一覧として読める。

### Loop 9：`sketch.js`をp5ライフサイクルへ限定する

**Objective**

初見の人がp5.jsの入口を数十行で把握できるようにする。

**Test first**

- `setup()`、`draw()`、`windowResized()`の現在の動作を確認する。

**Minimal implementation**

最終的な`sketch.js`を次に近づける。

```js
let simulation;

function setup() {
    pixelDensity(CONFIG.canvas.pixelDensity);
    createCanvas(windowWidth, windowHeight);
    frameRate(CONFIG.canvas.targetFps);

    simulation = new WaterSimulation(CONFIG);
    simulation.initialize();
}

function draw() {
    simulation.updateAndRender();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    simulation.resize();
}
```

**Verification**

```bash
node --check src/sketch.js
```

**Refactor checkpoint**

- `sketch.js`に粒子配列、障害物配列、飛沫生成、描画詳細を残さない。
- p5.jsが呼ぶグローバル関数は維持する。

**Completion criteria**

- `sketch.js`だけを読めば、作品の入口とライフサイクルが分かる。

### Loop 10：ファイルを役割別フォルダへ移動する

**Objective**

目的のコードをファイル名とフォルダから見つけられるようにする。

**Test first**

- 移動前に`index.html`の読み込み順を記録する。

**Minimal implementation**

1. particleファイルだけを`particles/`へ移して確認する。
2. `FlowField`と`Obstacle`を`physics/`へ移して確認する。
3. 描画クラスを`rendering/`へ移して確認する。
4. Systemクラスを`systems/`へ配置する。
5. 最後に`WaterSimulation`を`simulation/`へ配置する。
6. 各移動後に`index.html`のパスを更新する。

推奨読み込み順は次のとおり。

```text
p5.js
config / types
utils
particles / physics
rendering
systems
simulation
sketch
```

**Verification**

- ブラウザコンソールに`is not defined`がないことを各移動後に確認する。
- 全ファイルへ`node --check`を実行する。

**Refactor checkpoint**

- ファイル移動とメソッド変更を同時に行わない。
- `index.html`へ用途別の短いコメントを追加して読み込み順を明示する。

**Completion criteria**

- 目標構成どおりに分類され、ブラウザで起動する。

### Loop 11：public APIへJSDocを追加する

**Objective**

他ファイルから使うクラスと関数の契約をIDEで確認できるようにする。

**Test first**

- 各publicメソッドについて、引数・戻り値・副作用をコードを読まず説明できるか確認する。

**Minimal implementation**

次の順にJSDocを追加する。

1. `WaterSimulation`
2. `CollisionSystem`
3. `SplashSystem`
4. `Obstacle.resolveCollision()`
5. `FlowField.lookup()`
6. `Particle`のconstructor、`update()`、`resetIfNeeded()`、`display()`
7. `WaterLayers`のpublicメソッド

**Verification**

- IDEホバーで引数と戻り値が表示される。
- JSDocの型名が存在する。
- `@returns {void}`と値を返すメソッドが矛盾していない。

**Refactor checkpoint**

- 実装を日本語へ翻訳しただけの長いコメントを追加しない。
- 「なぜ必要か」「単位」「副作用」を優先する。
- JSDoc追加とロジック変更を混ぜない。

**Completion criteria**

- 他ファイルから呼ばれるメソッドの契約が明示されている。

### Loop 12：不要コード・重複・表記を整理する

**Objective**

視線を止める不要情報を減らし、コードスタイルを揃える。

**Test first**

- 削除候補を一覧にし、本当に参照されていないか検索する。

**Minimal implementation**

- `sketch.js`に残っている古い定数コメントを削除する。
- `FoamParticle.getCollisionRadius()`の共通フォールバックを`Particle`へ統合する。
- セミコロン、空行、演算子周辺スペースを揃える。
- `this.debugConfig = debugConfig`など不足しているセミコロンを揃える。
- コメントの誤字と表記ゆれを直す。
- public API以外の自明な説明コメントを削減する。

**Verification**

```bash
rg -n 'const PIXEL|const TARGET|const FLOW_' src
node --check src/sketch.js
```

移動後の全JSファイルにも構文確認を実行する。

**Refactor checkpoint**

- このLoopで変数名変更を行う場合は、1種類ずつ検索して置換する。
- 見た目や設定値を変更しない。

**Completion criteria**

- コメントアウトされた旧実装と明らかな重複が残っていない。

### Loop 13：回帰・性能確認

**Objective**

構造だけが変わり、作品の動作と性能が維持されていることを確認する。

**Test first / Verification**

- すべてのJavaScriptへ`node --check`を実行する。
- ブラウザコンソールにエラーがない。
- 主流、表面流、泡、飛沫が表示される。
- Curl Noiseに沿って流れる。
- 障害物へ衝突し、接線方向へ流れる。
- 衝突法線方向へ飛沫が出る。
- 発光とブラーが分割前と同じである。
- ウィンドウリサイズ後も表示と衝突が一致する。
- FPSが基準値から大幅に低下していない。

**Refactor checkpoint**

- 問題があれば「ファイル読み込み」「初期化」「更新」「衝突」「描画」の順に切り分ける。
- 複数Loopをまとめて直さず、最後に成功したLoopへ戻って確認する。

**Completion criteria**

- 分割前と同じ見た目・操作・性能で動作する。
- `sketch.js`がp5ライフサイクル中心の短いファイルになっている。
- 配列と状態の所有者が一意になっている。
- public APIにJSDocがある。

## 検証戦略

### 各Loop共通

1. 変更前に対象動作を確認する。
2. 最小変更を行う。
3. 対象ファイルへ`node --check`を実行する。
4. ブラウザで対象動作だけを確認する。
5. 名前・JSDoc・重複を整える。
6. 再度構文確認とブラウザ確認を行う。

### 構文確認

ファイル移動前は次を使う。

```bash
node --check src/config.js
node --check src/Particle.js
node --check src/FoamParticle.js
node --check src/SplashParticle.js
node --check src/FlowField.js
node --check src/Obstacle.js
node --check src/WaterLayers.js
node --check src/sketch.js
```

移動後は新しいパスへ読み替える。

### 自動テストについて

現在はGlobal Modeかつテスト環境がないため、この計画では依存パッケージを追加しない。`collisionMath.js`のような純粋関数が安定した後、Node標準テストまたはVitestを導入する別計画を作る。

最初に自動テストする候補は次のとおり。

- 4辺の最近接面判定
- 法線に対する衝突速度
- 接線速度への変換
- 寿命比率と透明度計算
- 障害物の画面比率座標計算

## ロールバック / フォローアップ

- 1Loopを1コミット候補とし、移動・挙動変更・文書追加を混ぜない。
- JSDoc追加だけのLoopではロジックへ触れない。
- ファイル移動後に読み込みエラーが出たら、`index.html`の順序とパスを最初に確認する。
- `WaterSimulation`が200行を超えて再び複雑になった場合のみ、ParticleSystemの追加を検討する。
- `utils/`が3ファイル以上になったら、汎用別ではなく`physics/`や`rendering/`へ戻せないか見直す。
- ES Modules、TypeScript、自動テスト環境の導入は、この構造整理が完了してから別計画にする。
