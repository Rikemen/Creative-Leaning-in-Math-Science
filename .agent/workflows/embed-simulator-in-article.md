---
description: 作成済みの public/simulations/{slug}/ シミュレーターを記事データに紐づけ、記事末尾に埋め込む
---

# シミュレーター記事埋め込みワークフロー

**Trigger:** `/embed-simulator-in-article`

**Description:**
`public/simulations/{articleSlug}/index.html` として作成済みの p5.js シミュレーターを、記事の `ArticleData.simulation` に登録して記事末尾へ表示する。

---

## 1. 対象記事とシミュレーターの確認

- **Goal:** 記事 slug とシミュレーター slug の対応を確定する。
- **Action:**
  - ユーザーから対象記事 slug を受け取る。
  - 記事データファイルを特定する。
  - `public/simulations/{articleSlug}/index.html` と `sketch.js` が存在することを確認する。

確認対象:

```text
src/content/{category}/{articleSlug}.ts
public/simulations/{articleSlug}/index.html
public/simulations/{articleSlug}/sketch.js
```

存在確認コマンド例:

```bash
rg -n 'slug: "{articleSlug}"|{articleSlug}' src/content src/content/articles.ts
test -f public/simulations/{articleSlug}/index.html
test -f public/simulations/{articleSlug}/sketch.js
```

## 2. ArticleData 型を確認する

- **Goal:** 現在の埋め込み仕様に合わせる。
- **Action:**
  - `src/content/types.ts` に `ArticleSimulation` と `ArticleData.simulation` があることを確認する。
  - なければ、このワークフローだけでは進めず、先に設計変更が必要であることを報告する。

現在の想定:

```ts
simulation?: {
  slug: string;
  title: string;
  description: string;
  height?: number;
}
```

## 3. 記事データに simulation を追加する

- **Goal:** 記事末尾の `SimulationEmbed.vue` から iframe 表示できる状態にする。
- **Action:**
  - 対象記事の `ArticleData` オブジェクトに `simulation` を追加する。
  - `slug` は原則として記事 slug と同じにする。
  - `title` はシミュレーターの見出しとして自然な日本語にする。
  - `description` は記事下部で何を操作・確認するかを1文で説明する。
  - `height` は初期値として `560` を目安にし、縦長シミュレーターなら調整する。

例:

```ts
const article: ArticleData = {
  title: "記事タイトル",
  simulation: {
    slug: "derivative-coefficient",
    title: "微分係数シミュレーター",
    description: "点を動かしながら、割線が接線に近づく様子を確認します。",
    height: 640,
  },
  sections: [
    // ...
  ],
};
```

## 4. 表示仕様を確認する

- **Goal:** 記事側の埋め込み経路を理解したうえで確認する。
- **Action:**
  - `src/views/ArticleDetail.vue` が `articleData.simulation` を `SimulationEmbed` に渡していることを確認する。
  - `src/components/SimulationEmbed.vue` が `/simulations/{simulation.slug}/index.html` を iframe の `src` にしていることを確認する。
  - 右カラムではなく記事末尾に表示されることを確認する。

現在のURL生成規約:

```text
/simulations/{simulation.slug}/index.html
```

## 5. 動作確認

- **Goal:** 単体URLと記事内 iframe の両方で動くことを確認する。
- **Action:**
  - dev server を起動する。
  - 単体URLを確認する。
  - 記事URLを確認する。

確認URL:

```text
http://127.0.0.1:8080/simulations/{articleSlug}/index.html
http://127.0.0.1:8080/article/{articleSlug}
```

確認項目:

- 単体シミュレーターが表示される
- 記事末尾にシミュレーター見出し・説明・iframe が表示される
- 「大きく開く」リンクで単体URLを開ける
- スマホ幅で本文、スライダー、描画領域が重ならない
- 状態メッセージが描画領域に被らない
- コンソールエラーがない

## 6. 検証

`src/content` を変更するため、最低限ビルドを確認する。

推奨:

```bash
npm run build
```

記事カタログ・レジストリも変更した場合:

```bash
npm run test -- src/content/__tests__/articles.spec.ts src/content/__tests__/contentRegistry.spec.ts
```

---

**補足:**

- iframe 埋め込みを使うため、デプロイ時のヘッダーは同一オリジン iframe を許可する必要がある。
- `firebase.json` は `frame-ancestors 'self'` と `X-Frame-Options: SAMEORIGIN` を前提にする。
- シミュレーター本体は `public/simulations/{slug}/` に置き、記事本文ファイルには描画ロジックを入れない。
