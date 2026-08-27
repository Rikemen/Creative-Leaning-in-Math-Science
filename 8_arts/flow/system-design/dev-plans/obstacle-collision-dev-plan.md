# 矩形障害物・粒子衝突 実装計画

| Loop | Task | User-facing summary | Unit test | Refactor checkpoint |
| --- | --- | --- | --- | --- |
| 1 | 障害物を表示 | 画面内にリサイズ対応の矩形障害物を配置します。 | 構文確認＋目視 | 座標計算を`Obstacle`へ閉じ込める |
| 2 | 衝突面を判定 | 粒子が矩形のどの面へ入ったか判定します。 | 4方向の手動確認 | 描画と判定を分離する |
| 3 | 速度を接線へ変換 | めり込みを戻し、障害物表面に沿って流します。 | 上面・側面の目視 | 法線と接線の計算を1か所にする |
| 4 | 粒子に衝突状態を追加 | 前位置と飛沫クールダウンを粒子へ持たせます。 | 構文確認＋再衝突確認 | 既存の寿命・リセットを維持する |
| 5 | 法線方向の飛沫 | 衝突面の外側へ飛沫を発生させます。 | 4方向の飛沫確認 | 飛沫生成をヘルパーへ集約する |
| 6 | 描画ループへ接続 | 主流・表面流・泡へ障害物判定を組み込みます。 | ブラウザ結合確認 | 更新・衝突・描画の順序を固定する |
| 7 | リサイズ・性能確認 | サイズ変更後も障害物と水流を維持します。 | FPS・リサイズ確認 | 多数障害物用の最適化は後回しにする |

## ゴール / スコープ

次の動作を実装する。

- 画面幅に対する比率で矩形障害物を配置する。
- 粒子を小さな円として扱い、矩形との交差を判定する。
- 粒子が入ってきた面、または最も近い面の外向き法線を求める。
- 粒子位置を法線方向へ押し戻し、矩形内へのめり込みを解消する。
- 速度の法線成分を取り除き、接線成分だけを残して表面に沿わせる。
- 衝突速度が十分に大きいとき、外向き法線を基準に飛沫を発生させる。
- ウィンドウリサイズ時に障害物位置を再計算する。

今回の対象外は次のとおり。

- 円形・多角形・画像マスクとの衝突
- 連続衝突判定による高速粒子の完全なトンネリング防止
- 障害物が多数ある場合の空間分割
- 障害物自体の移動・回転
- 文字やロゴのマスク衝突

## 前提とリスク

- 現在のプロジェクトはp5.js Global Modeで動作している。
- 主流・表面流・泡は`Particle`またはその派生クラスとして位置と速度を持つ。
- 飛沫は既存の`SplashParticle`を法線対応へ変更する。
- 自動テスト環境がないため、`node --check`とブラウザでの4方向確認を各Loopの検証に使う。
- 現在の水粒子は最大速度が8px/frameなので、厚さ20px以上の障害物から始める。
- 粒子が障害物上面に静止すると、重力で毎フレーム再衝突する。最小接線速度と飛沫クールダウンで張り付き・飛沫連打を防ぐ。
- 衝突判定は粒子数×障害物数で実行される。障害物は最初は2〜5個に制限する。
- 既存の未コミット変更には触れず、この文書に実装コードだけをまとめる。

## 変更ファイル一覧

```text
src/config.js             設定追加
src/Obstacle.js           新規作成
src/Particle.js           前位置・半径・クールダウン追加
src/SplashParticle.js     法線方向への初速に変更
src/sketch.js             生成・衝突・飛沫・描画を接続
index.html                Obstacle.jsの読み込み追加
```

## Loop 1：障害物設定を追加する

### Objective

矩形の位置・サイズ・見た目と、衝突応答の調整値を`CONFIG`へ追加する。

### `src/config.js`への追加例

`CONFIG`の直下へ`obstacles`と`collision`を追加する。

```js
obstacles: {
    fillColor: [8, 18, 28, 255],
    strokeColor: [70, 150, 190, 220],
    strokeWeight: 1,

    items: [
        {
            xRatio: 0.12,
            yRatio: 0.45,
            widthRatio: 0.32,
            height: 28
        },
        {
            xRatio: 0.58,
            yRatio: 0.68,
            widthRatio: 0.28,
            height: 32
        }
    ]
},

collision: {
    // 粒子を矩形面から少し離す距離
    padding: 0.5,

    // 接線速度を何割残すか
    tangentRetention: 0.94,

    // 上面で停止しないための最低接線速度
    minTangentSpeed: 0.8,

    // この速度以上の衝突だけ飛沫対象にする
    minSplashImpactSpeed: 1.2,

    splashChance: 0.18,
    splashCount: 4,
    splashCooldownFrames: 8
},
```

`xRatio`、`yRatio`、`widthRatio`は画面サイズに対する割合である。例えば`xRatio: 0.12`なら、矩形の左端は画面幅の12%位置になる。

### Verification

```bash
node --check src/config.js
```

### Completion criteria

- 障害物の位置・見た目・衝突調整値がコード本体から分離されている。

## Loop 2：`Obstacle`クラスを追加する

### Objective

矩形表示、画面サイズへの追従、衝突面判定、位置補正、接線速度への変換を1クラスへまとめる。

### 新規`src/Obstacle.js`

```js
class Obstacle {
    constructor(config, style, collisionConfig) {
        this.config = config;
        this.style = style;
        this.collisionConfig = collisionConfig;

        this.resize();
    }

    resize() {
        this.x = width * this.config.xRatio;
        this.y = height * this.config.yRatio;
        this.w = width * this.config.widthRatio;
        this.h = this.config.height;
    }

    display() {
        push();

        fill(...this.style.fillColor);
        stroke(...this.style.strokeColor);
        strokeWeight(this.style.strokeWeight);

        rect(this.x, this.y, this.w, this.h);

        pop();
    }

    resolveCollision(particle) {
        const radius = particle.getCollisionRadius();

        const left = this.x - radius;
        const right = this.x + this.w + radius;
        const top = this.y - radius;
        const bottom = this.y + this.h + radius;

        const pos = particle.pos;

        // 拡張した矩形の外なら衝突していない。
        if (
            pos.x < left
            || pos.x > right
            || pos.y < top
            || pos.y > bottom
        ) {
            return null;
        }

        const previous = particle.prevPos;

        let normalX = 0;
        let normalY = 0;
        let correctedX = pos.x;
        let correctedY = pos.y;
        let contactX = constrain(pos.x, this.x, this.x + this.w);
        let contactY = constrain(pos.y, this.y, this.y + this.h);

        /*
         * 前フレーム位置から進入面を優先的に判定する。
         * 上から落ちてきた粒子は上面として扱われる。
         */
        if (previous.y <= top) {
            normalY = -1;
            correctedY = top - this.collisionConfig.padding;
            contactY = this.y;
        } else if (previous.y >= bottom) {
            normalY = 1;
            correctedY = bottom + this.collisionConfig.padding;
            contactY = this.y + this.h;
        } else if (previous.x <= left) {
            normalX = -1;
            correctedX = left - this.collisionConfig.padding;
            contactX = this.x;
        } else if (previous.x >= right) {
            normalX = 1;
            correctedX = right + this.collisionConfig.padding;
            contactX = this.x + this.w;
        } else {
            /*
             * すでに矩形内にいる場合は、
             * 最も近い面へ押し出す。
             */
            const distanceLeft = abs(pos.x - left);
            const distanceRight = abs(right - pos.x);
            const distanceTop = abs(pos.y - top);
            const distanceBottom = abs(bottom - pos.y);

            const nearest = min(
                distanceLeft,
                distanceRight,
                distanceTop,
                distanceBottom
            );

            if (nearest === distanceTop) {
                normalY = -1;
                correctedY = top - this.collisionConfig.padding;
                contactY = this.y;
            } else if (nearest === distanceBottom) {
                normalY = 1;
                correctedY = bottom + this.collisionConfig.padding;
                contactY = this.y + this.h;
            } else if (nearest === distanceLeft) {
                normalX = -1;
                correctedX = left - this.collisionConfig.padding;
                contactX = this.x;
            } else {
                normalX = 1;
                correctedX = right + this.collisionConfig.padding;
                contactX = this.x + this.w;
            }
        }

        // 補正前の速度から衝突の強さを求める。
        const normalSpeed =
            particle.vel.x * normalX
            + particle.vel.y * normalY;

        const impactSpeed = max(0, -normalSpeed);

        // 法線に直交する接線ベクトル。
        const tangentX = -normalY;
        const tangentY = normalX;

        let tangentSpeed =
            particle.vel.x * tangentX
            + particle.vel.y * tangentY;

        tangentSpeed *= this.collisionConfig.tangentRetention;

        /*
         * 真上から落ちた粒子は接線速度がほぼ0になる。
         * 左右どちらかへ最低速度を与えて張り付きを防ぐ。
         */
        if (
            abs(tangentSpeed)
            < this.collisionConfig.minTangentSpeed
        ) {
            const direction =
                tangentSpeed === 0
                    ? (random() < 0.5 ? -1 : 1)
                    : Math.sign(tangentSpeed);

            tangentSpeed =
                direction
                * this.collisionConfig.minTangentSpeed;
        }

        particle.pos.set(correctedX, correctedY);

        // 法線速度を除去し、接線方向だけを残す。
        particle.vel.set(
            tangentX * tangentSpeed,
            tangentY * tangentSpeed
        );

        return {
            x: contactX,
            y: contactY,
            normalX,
            normalY,
            impactSpeed
        };
    }
}
```

### 処理の意味

速度`v`を外向き法線`n`と接線`t`へ分ける。

```text
法線速度 = v・n
接線速度 = v・t
新しい速度 = t × 接線速度
```

法線方向へ進む速度を取り除くため、粒子は矩形を通過せず、表面に沿って流れる。

### Verification

```bash
node --check src/Obstacle.js
```

### Refactor checkpoint

- `Obstacle`は粒子配列や飛沫配列を直接操作しない。
- 衝突結果を返し、飛沫を出すかどうかは`sketch.js`が決める。

## Loop 3：`Particle`へ前位置とクールダウンを追加する

### Objective

どの面から入ったかを判定できるようにし、同じ粒子が毎フレーム飛沫を出すことを防ぐ。

### `src/Particle.js`の変更

コンストラクターへ`prevPos`とクールダウンを追加する。

```js
this.pos = createVector(0, 0);
this.prevPos = createVector(0, 0);
this.vel = createVector(0, 0);
this.acc = createVector(0, 0);
this.collisionCooldown = 0;
```

`reset()`で前位置も現在位置へ合わせる。

```js
this.prevPos.set(this.pos);
this.collisionCooldown = 0;
```

`update()`を次へ変更する。

```js
update() {
    // 移動前の位置を保存する。
    this.prevPos.set(this.pos);

    this.vel.add(this.acc);
    this.vel.limit(this.config.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    this.life -= 1;

    if (this.collisionCooldown > 0) {
        this.collisionCooldown -= 1;
    }
}
```

クラスへ次の2メソッドを追加する。

```js
getCollisionRadius() {
    return max(1, this.style.weight * 0.5);
}

startCollisionCooldown(frames) {
    this.collisionCooldown = frames;
}
```

### 注意点

`FoamParticle`は`style.weight`を持たないため、次のいずれかを選ぶ。

1. `FoamParticle`へ専用の`getCollisionRadius()`を追加する。
2. 親クラス側で`weight`がない場合のフォールバックを使う。

親クラス側で対応する場合は次の形にする。

```js
getCollisionRadius() {
    if (this.style.weight !== undefined) {
        return max(1, this.style.weight * 0.5);
    }

    if (this.size !== undefined) {
        return max(1, this.size * 0.5);
    }

    return 1;
}
```

### Verification

```bash
node --check src/Particle.js
node --check src/FoamParticle.js
```

### Completion criteria

- 移動前位置が毎フレーム保持される。
- 衝突後の飛沫生成を数フレーム抑制できる。

## Loop 4：飛沫を法線方向へ出す

### Objective

上面なら上、左面なら左というように、衝突面の外側へ飛沫を飛ばす。

### `src/config.js`の`SplashParticle`設定変更

既存の`speedXMin`、`speedXMax`、`speedYMin`、`speedYMax`を次へ置き換える。

```js
splash: {
    color: [220, 245, 255],
    gravity: 0.08,

    normalSpeedMin: 1.5,
    normalSpeedMax: 4.5,
    tangentSpeedMin: -2,
    tangentSpeedMax: 2,

    lifeMin: 30,
    lifeMax: 80,
    sizeMin: 1,
    sizeMax: 3,

    // 画面下端で使う既存設定
    spawnChance: 0.02,
    spawnCount: 3
},
```

### `src/SplashParticle.js`のコンストラクター変更

```js
constructor(
    x,
    y,
    normalX,
    normalY,
    config
) {
    this.config = config;

    this.pos = createVector(x, y);

    const tangentX = -normalY;
    const tangentY = normalX;

    const normalSpeed = random(
        config.normalSpeedMin,
        config.normalSpeedMax
    );

    const tangentSpeed = random(
        config.tangentSpeedMin,
        config.tangentSpeedMax
    );

    this.vel = createVector(
        normalX * normalSpeed
            + tangentX * tangentSpeed,
        normalY * normalSpeed
            + tangentY * tangentSpeed
    );

    this.acc = createVector(0, config.gravity);

    this.life = random(
        config.lifeMin,
        config.lifeMax
    );

    this.maxLife = this.life;

    this.size = random(
        config.sizeMin,
        config.sizeMax
    );
}
```

残りの`follow()`、`update()`、`isDead()`、`display()`は現在の実装をそのまま利用できる。

### Verification

```bash
node --check src/SplashParticle.js
```

### Completion criteria

- 上面衝突では上向き、左右面衝突では外向きに飛沫が出る。

## Loop 5：障害物を`sketch.js`へ接続する

### Objective

障害物生成、粒子衝突、飛沫生成、障害物描画を既存ループへ組み込む。

### グローバル配列を追加

`src/sketch.js`の配列宣言付近へ追加する。

```js
const obstacles = [];
```

### `setup()`で障害物を作る

```js
for (const item of CONFIG.obstacles.items) {
    obstacles.push(
        new Obstacle(
            item,
            CONFIG.obstacles,
            CONFIG.collision
        )
    );
}
```

### 衝突飛沫生成ヘルパーを追加

```js
function spawnCollisionSplashes(collision) {
    if (
        collision.impactSpeed
        < CONFIG.collision.minSplashImpactSpeed
    ) {
        return;
    }

    if (random() >= CONFIG.collision.splashChance) {
        return;
    }

    for (
        let i = 0;
        i < CONFIG.collision.splashCount;
        i++
    ) {
        splashParticles.push(
            new SplashParticle(
                collision.x,
                collision.y,
                collision.normalX,
                collision.normalY,
                CONFIG.splash
            )
        );
    }
}
```

### 粒子と全障害物を判定するヘルパーを追加

```js
function resolveObstacleCollisions(
    particle,
    canSpawnSplash = false
) {
    for (const obstacle of obstacles) {
        const collision =
            obstacle.resolveCollision(particle);

        if (!collision) {
            continue;
        }

        if (
            canSpawnSplash
            && particle.collisionCooldown <= 0
        ) {
            spawnCollisionSplashes(collision);

            particle.startCollisionCooldown(
                CONFIG.collision.splashCooldownFrames
            );
        }
    }
}
```

### `updateWaterParticles()`の処理順を変更

`particle.update()`の直後、`resetIfNeeded()`と`display()`の前に衝突処理を入れる。

```js
particle.applyGravity();
particle.follow(flowField);
particle.update();

resolveObstacleCollisions(
    particle,
    canSpawnSplash
);

const impact = particle.resetIfNeeded();

particle.display(target);
```

処理順は必ず次にする。

```text
力を加える
  ↓
位置を更新する
  ↓
障害物衝突を解決する
  ↓
画面外リセット
  ↓
描画する
```

### 画面下端の飛沫生成を変更

`SplashParticle`の引数が増えるため、既存の生成箇所を次へ変更する。

```js
new SplashParticle(
    impact.x,
    impact.y,
    0,
    -1,
    CONFIG.splash
)
```

画面下端から外側へ飛ばすため、法線は上向き`(0, -1)`とする。

### 泡にも衝突判定を追加

泡の`update()`直後へ追加する。泡から飛沫は生成しない。

```js
foam.applyGravity();
foam.follow(flowField);
foam.update();

resolveObstacleCollisions(foam, false);

foam.resetIfNeeded();
foam.display(waterLayers.foam);
```

### 障害物を描画する

`waterLayers.composite()`の後へ追加する。

```js
waterLayers.composite();

for (const obstacle of obstacles) {
    obstacle.display();
}
```

障害物を最後に描くことで、過去フレームの水の軌跡が矩形内部に見えることを防ぐ。

### `windowResized()`へ追加

```js
for (const obstacle of obstacles) {
    obstacle.resize();
}
```

### Verification

```bash
node --check src/sketch.js
```

### Completion criteria

- 主流と表面流が矩形を通過しない。
- 泡も障害物表面に沿う。
- 飛沫は障害物の外側へ飛ぶ。

## Loop 6：`index.html`へ読み込みを追加する

### Objective

`Obstacle`クラスを`sketch.js`から利用できるようにする。

### 変更例

`FlowField.js`の後、`sketch.js`の前へ追加する。

```html
<script src="src/FlowField.js"></script>
<script src="src/Obstacle.js"></script>
<script src="src/WaterLayers.js"></script>
<script src="src/sketch.js"></script>
```

### Completion criteria

- ブラウザコンソールに`Obstacle is not defined`が表示されない。

## Loop 7：リサイズと性能を確認する

### Objective

画面サイズ変更後も障害物の表示位置と衝突領域を一致させ、現在の粒子数で実用的なFPSを維持する。

### Test first

- ウィンドウを横長から縦長へ変更し、障害物の描画位置と粒子が押し戻される位置を比較する。
- 障害物追加前のFPSを記録し、追加後のFPSと比較する。

### Minimal implementation

- `windowResized()`から全障害物の`resize()`を呼ぶ。
- デバッグ中は主流1,000、表面流500程度に減らし、衝突挙動を先に確定する。
- 動作確定後に本来の粒子数へ戻す。
- このLoopでは空間ハッシュや四分木を追加しない。

### Verification

```bash
node --check src/Obstacle.js
node --check src/sketch.js
```

### Refactor checkpoint

- リサイズ処理が`Obstacle.resize()`へ集約されている。
- FPS低下の原因を調べる前に、描画・ブラー・衝突を同時に変更しない。

### Completion criteria

- リサイズ後も矩形の見た目と衝突面が一致する。
- 障害物2〜5個でFPSが許容範囲に収まる。

## 検証戦略

### 構文確認

```bash
node --check src/config.js
node --check src/Obstacle.js
node --check src/Particle.js
node --check src/FoamParticle.js
node --check src/SplashParticle.js
node --check src/sketch.js
```

### ブラウザ確認

1. `CONFIG.debug.showFlowField`を一時的に`false`にする。
2. 粒子数を一時的に主流1,000、表面流500へ下げる。
3. 上面に落ちた粒子が矩形内へ入らないことを確認する。
4. 粒子が左右いずれかへ流れ、障害物端から再び落下することを確認する。
5. 左右面へ当たる配置を追加し、外向き法線と接線速度を確認する。
6. 衝突時だけ飛沫が出て、接触中に毎フレーム大量発生しないことを確認する。
7. ウィンドウサイズ変更後に障害物位置と衝突位置が一致することを確認する。
8. 粒子数を本来の値へ戻し、FPS低下を確認する。

### デバッグ用の一時設定

衝突を確認しやすくする場合は、障害物を画面中央へ大きく配置する。

```js
{
    xRatio: 0.2,
    yRatio: 0.5,
    widthRatio: 0.6,
    height: 60
}
```

## ロールバック / フォローアップ

- `Obstacle.js`追加、`Particle.js`変更、飛沫変更、`sketch.js`接続を別Loopとしてコミット可能な状態に保つ。
- 衝突応答が不安定な場合は、まず飛沫生成を無効化し、位置補正と接線速度だけを確認する。
- 粒子が障害物を通り抜ける場合は、障害物を厚くするか、次段階で移動線分と矩形の連続衝突判定を追加する。
- 障害物が10個以上へ増え、FPSが低下した場合は、格子または空間ハッシュで候補障害物を絞る。
- 文字・ロゴでは矩形の集合を増やさず、ピクセルマスクまたは距離場を使う別実装へ進む。
