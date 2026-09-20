---
description: メモからスライドの構成案を水色ベースHTMLとして生成する。ページ種類・キーメッセージ・ビジュアル種類・備考をテーブルで管理し、インライン編集・JSON入出力を備える。
---

# スライド構成案HTML生成ワークフロー

## 目的

ユーザーが指定したメモファイルを読み込み、その内容をもとに **スライドの構成案（アウトライン）** を **水色ベースの1ファイル完結HTML** として生成する。

---

## 入力

- ユーザーが指定するメモファイル（Markdown等）

## 出力先の命名規則

生成するHTMLファイルは `docs/slides/` ディレクトリに配置する。

### ルール

1. ユーザーから依頼されたプレゼン名・メモファイル名を **簡潔な英語** に翻訳する
2. 英語タイトルを **kebab-case**（小文字・ハイフン区切り）に変換する
3. 生成日を `YYYYMMDD` 形式で取得する
4. 出力先を `docs/slides/{kebab-case-title}-outline-{YYYYMMDD}.html` とする
5. `docs/slides/` ディレクトリが存在しない場合は作成する
6. 既存の同名ファイルがある場合は上書き前に確認する

### 命名例

| メモファイル | 出力ファイル名（2026年6月14日に生成した場合） |
|---|---|
| `memo-20260614.md`（バイブコーディング発表） | `docs/slides/vibe-coding-presentation-outline-20260614.html` |
| `memo-product-launch.md` | `docs/slides/product-launch-outline-20260614.html` |

---

## ベース仕様

**デザイントークン・基本スタイル・編集JS・モーダル・トースト** は `/make-lightblue-doc` ワークフロー（`.agent/workflows/make-lightblue-doc.md`）の仕様に **完全準拠** する。本ワークフローでは、それに加える **スライド構成案固有の差分** のみを定義する。

---

## スライド構成案固有の機能

### 1. メモ解析とスライド分解

メモファイルの内容を読み込み、以下の観点でスライドページに分解する：

- メモ内の見出し（`##`, `###` 等）やトピックの切り替わりをスライドの区切りとする
- 1スライド = 1メッセージの原則で分解する
- 情報量が多いトピックは複数スライドに分割する
- プレゼンの流れとして自然な順序に並べる

### 2. ページ種類の定義

各スライドには以下の **ページ種類** を割り当てる：

| ページ種類 | 説明 | 用途 |
|---|---|---|
| **表紙** | プレゼンタイトル・発表者名・日付 | 最初の1枚 |
| **目次** | アジェンダ・発表の全体像 | 表紙の直後 |
| **扉** | セクション区切り。大きなトピック名のみ | トピックの切り替わり |
| **本文** | キーメッセージ + ビジュアル要素 | メインの情報伝達 |
| **裏表紙** | まとめ・Q&A・連絡先など | 最後の1枚 |

### 3. スライド構成テーブル

メインコンテンツとして以下のカラムを持つテーブルを配置する。

| カラム | 説明 | 備考 |
|---|---|---|
| **No.** | スライド通し番号 | 1から連番 |
| **ページ種類** | 表紙 / 目次 / 扉 / 本文 / 裏表紙 | セレクトボックスで変更可能 |
| **スライドタイトル** | そのスライドの見出し | 全ページ種類で必須 |
| **キーメッセージ** | 聴衆に伝えたい1メッセージ | 本文のみ。扉・表紙等は「—」 |
| **ビジュアル** | 図表 / 写真 / 動画 / Canvas(p5.js) / なし | 本文のみ。どんな図表を使うかの指定 |
| **備考** | スライドの意図、他案、内部メモ | スライドには載せない裏メモ |

```html
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th style="width:50px;">No.</th>
        <th style="width:100px;">ページ種類</th>
        <th style="width:200px;">スライドタイトル</th>
        <th style="width:250px;">キーメッセージ</th>
        <th style="width:140px;">ビジュアル</th>
        <th>備考</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="slide-no">1</td>
        <td>
          <select class="page-type-select">
            <option value="表紙" selected>表紙</option>
            <option value="目次">目次</option>
            <option value="扉">扉</option>
            <option value="本文">本文</option>
            <option value="裏表紙">裏表紙</option>
          </select>
        </td>
        <td>スライドタイトル</td>
        <td>—</td>
        <td>
          <select class="visual-type-select">
            <option value="なし" selected>なし</option>
            <option value="図表">図表</option>
            <option value="写真">写真</option>
            <option value="動画">動画</option>
            <option value="Canvas(p5.js)">Canvas(p5.js)</option>
          </select>
        </td>
        <td class="note-cell">備考テキスト</td>
      </tr>
      <!-- 以下、スライド数分繰り返し -->
    </tbody>
  </table>
</div>
```

### 4. ページ種類セレクトの色分けJS

ページ種類に応じてセレクトボックスの色を動的に変化させる。

```javascript
function applyPageTypeColor(select) {
  const map = {
    '表紙':   { border: '#7c3aed', color: '#7c3aed', bg: '#ede9fe' },
    '目次':   { border: '#0284c7', color: '#0284c7', bg: '#e0f2fe' },
    '扉':     { border: '#d97706', color: '#d97706', bg: '#fef3c7' },
    '本文':   { border: '#16a34a', color: '#16a34a', bg: '#dcfce7' },
    '裏表紙': { border: '#64748b', color: '#64748b', bg: '#f1f5f9' },
  };
  const s = map[select.value] || { border: '#cbd5e1', color: '#64748b', bg: '#f1f5f9' };
  select.style.borderColor = s.border;
  select.style.color = s.color;
  select.style.background = s.bg;
}

function applyVisualTypeColor(select) {
  const map = {
    '図表':          { border: '#0284c7', color: '#0284c7', bg: '#e0f2fe' },
    '写真':          { border: '#16a34a', color: '#16a34a', bg: '#dcfce7' },
    '動画':          { border: '#dc2626', color: '#dc2626', bg: '#fee2e2' },
    'Canvas(p5.js)': { border: '#7c3aed', color: '#7c3aed', bg: '#ede9fe' },
  };
  const s = map[select.value] || { border: '#cbd5e1', color: '#64748b', bg: '#f1f5f9' };
  select.style.borderColor = s.border;
  select.style.color = s.color;
  select.style.background = s.bg;
}

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('page-type-select')) applyPageTypeColor(e.target);
  if (e.target.classList.contains('visual-type-select')) applyVisualTypeColor(e.target);
});
document.querySelectorAll('.page-type-select').forEach(applyPageTypeColor);
document.querySelectorAll('.visual-type-select').forEach(applyVisualTypeColor);
```

### 5. サイドバー目次

左固定サイドバーに以下の構成で目次を配置する：

```html
<aside class="sidebar" id="sidebar">
  <span class="sidebar__label">スライド構成</span>
  <ul class="sidebar__nav" id="sidebarNav">
    <li><a href="#sec-overview">概要</a></li>
    <li><a href="#sec-slide-outline">スライド構成テーブル</a></li>
    <li><a href="#sec-flow-notes">フロー補足</a></li>
  </ul>
</aside>
```

### 6. HTMLセクション構成

生成するHTMLは以下のセクション構成とする：

#### セクション1: 概要（`data-section="overview"`）
- プレゼンのタイトル、発表日、対象者、発表時間（メモから読み取れる場合）
- プレゼンの目的・ゴールの要約

#### セクション2: スライド構成テーブル（`data-section="slide-outline"`）
- 上記「3. スライド構成テーブル」のテーブルを配置
- メモの内容を分解し、全スライドの行を生成する

#### セクション3: フロー補足（`data-section="flow-notes"`）
- スライド全体の流れに関する補足・注意事項
- 時間配分の目安（わかる場合）
- 演出上のポイント（デモを入れる、動画を流す等）

### 7. エクスポート時のセレクト同期

`exportJSON()` 内で Blob 生成の **直前** に、select の選択状態を DOM 属性に同期する。`cancelEdit()` の innerHTML 復元後に `applyPageTypeColor` / `applyVisualTypeColor` を再実行する。

```javascript
// exportJSON() 内に追加
document.querySelectorAll('.page-type-select').forEach(select => {
  Array.from(select.options).forEach(opt => {
    opt.value === select.value ? opt.setAttribute('selected','selected') : opt.removeAttribute('selected');
  });
});
document.querySelectorAll('.visual-type-select').forEach(select => {
  Array.from(select.options).forEach(opt => {
    opt.value === select.value ? opt.setAttribute('selected','selected') : opt.removeAttribute('selected');
  });
});

// cancelEdit() の末尾に追加
section.querySelectorAll('.page-type-select').forEach(applyPageTypeColor);
section.querySelectorAll('.visual-type-select').forEach(applyVisualTypeColor);
```

---

## スライド構成案固有のCSS（追加分）

`make-lightblue-doc.md` のベーススタイルに以下を **追加** する。

```css
/* ヘッダーバッジ */
.site-header__title { font-family:var(--font-display); font-size:var(--font-body-lg-size); font-weight:700; color:var(--color-primary); letter-spacing:0.05em; text-transform:uppercase; }
.site-header__badge { display:inline-block; margin-left:10px; padding:2px 10px; border-radius:var(--radius-pill); border:1px solid var(--color-hairline-on-dark); color:var(--color-primary); background:var(--color-canvas-night-soft); font-size:10px; font-weight:700; letter-spacing:0.1em; }
.site-header__hamburger { display:none; background:none; border:none; cursor:pointer; padding:6px; margin-right:12px; color:var(--color-on-primary); }
.site-header__hamburger svg { display:block; }
.sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(15,23,42,0.4); z-index:89; }

/* テーブル */
.table-wrap { overflow-x:auto; margin-bottom:var(--space-xl); border:1px solid var(--color-hairline-on-dark); border-radius:var(--radius-sm); }
table { width:100%; border-collapse:collapse; font-size:13px; line-height:1.6; }
thead th { background:var(--color-canvas-night); font-weight:700; text-align:left; padding:12px 16px; border-bottom:1px solid var(--color-hairline-on-dark); white-space:nowrap; text-transform:uppercase; font-size:11px; letter-spacing:0.05em; color:var(--color-primary); }
tbody td { padding:12px 16px; border-bottom:1px solid var(--color-hairline-on-dark); vertical-align:middle; color:var(--color-on-primary-mute); }
tbody tr:last-child td { border-bottom:none; }
tbody tr:hover { background:var(--color-canvas-night); }

/* スライド番号 */
.slide-no { font-family:var(--font-display); font-weight:700; color:var(--color-primary); text-align:center; }

/* ページ種類セレクト */
.page-type-select, .visual-type-select { background:var(--color-canvas-night); color:var(--color-on-primary); border:1px solid var(--color-hairline-on-dark); border-radius:var(--radius-pill); font-size:11px; font-weight:700; padding:2px 8px; cursor:pointer; outline:none; transition:all 0.15s; }
.page-type-select:hover, .visual-type-select:hover { border-color:var(--color-primary); }

/* 備考セルのスタイル（薄い背景で区別） */
.note-cell { font-size:12px; color:var(--color-ink-mute); font-style:italic; }

/* 注意ボックス */
.callout { border:1px solid var(--color-hairline-on-dark); background:var(--color-canvas-night); border-radius:var(--radius-sm); padding:var(--space-md) var(--space-lg); margin-bottom:var(--space-xl); font-size:13px; line-height:1.6; border-left:3px solid var(--color-primary); }
.callout strong { font-weight:700; color:var(--color-primary); }

/* ヒーロー */
.hero-banner { padding:var(--space-xl) 0 var(--space-xs); margin-bottom:var(--space-sm); }
.hero-banner h1 { font-family:var(--font-display); font-size:var(--font-display-xxl-size); line-height:1.2; font-weight:700; margin-bottom:var(--space-xs); color:var(--color-primary); text-transform:uppercase; }
.hero-banner p { font-size:var(--font-body-lg-size); color:var(--color-on-primary-mute); }

/* 扉行のハイライト */
tbody tr.row-cover td { background:rgba(124, 58, 237, 0.04); }
tbody tr.row-toc td { background:rgba(2, 132, 199, 0.04); }
tbody tr.row-divider td { background:rgba(217, 119, 6, 0.04); font-weight:700; }
tbody tr.row-back-cover td { background:rgba(100, 116, 139, 0.04); }

/* 印刷時の追加 */
@media print {
  .page-type-select, .visual-type-select { border:none; background:transparent; padding:0; pointer-events:none; color:inherit!important; -webkit-appearance:none; appearance:none; }
  .note-cell { font-style:normal; }
}

/* レスポンシブ */
@media (max-width: 860px) {
  .site-header__hamburger { display:block; }
  .sidebar { transform:translateX(-100%); transition:transform 0.2s; }
  .sidebar.open { transform:translateX(0); }
  .sidebar-overlay.open { display:block; }
  .main-content { margin-left:0; padding:var(--space-xl); }
}
```

---

## コンテンツ生成ルール

### メモからスライドへの変換原則

1. **1スライド1メッセージ**: 1枚のスライドで伝えるメッセージは1つに絞る
2. **表紙・目次・裏表紙は必ず含める**: メモに明記がなくても自動で追加する
3. **扉ページの挿入**: メモ内の大きなトピック切り替わり（`##` レベル見出し等）には扉ページを挿入する
4. **ビジュアル推奨**: 本文スライドにはできる限りビジュアル要素を提案する。メモ中に「グラフ」「画像」「デモ」等の言及があれば適切なビジュアル種類を選択する
5. **備考の活用**: メモ内の補足情報、背景説明、他案などスライドに直接載せない情報は備考に記載する
6. **キーメッセージは簡潔に**: 聴衆が一目で理解できる1文（20〜40文字程度）にまとめる

### テーブル行のCSSクラス

ページ種類に応じて `<tr>` に以下のクラスを付与する：

| ページ種類 | CSSクラス |
|---|---|
| 表紙 | `row-cover` |
| 目次 | `row-toc` |
| 扉 | `row-divider` |
| 本文 | （なし） |
| 裏表紙 | `row-back-cover` |

---

## 検証方法

> **ブラウザサブエージェントによる自動確認は不要。** 生成後のHTML表示確認はユーザー自身が `file://` で開いて目視確認する運用とする。エージェントは HTML ファイルの生成完了をもってタスク完了とし、`browser_subagent` ツールを呼び出さないこと。

---

## チェックリスト

- [ ] `file://` でエラーなく表示される
- [ ] サイドバー目次リンクが正しくスクロールし、アクティブ項目がハイライトされる
- [ ] モバイル幅でハンバーガーメニューが動作する
- [ ] ページ種類セレクト変更時に色が動的に変わる（表紙=紫, 目次=青, 扉=黄, 本文=緑, 裏表紙=灰）
- [ ] ビジュアル種類セレクト変更時に色が動的に変わる（図表=青, 写真=緑, 動画=赤, Canvas=紫, なし=灰）
- [ ] インライン編集の保存・キャンセルが正しく動作する
- [ ] JSONエクスポート/インポートが往復可逆（セレクト値も含む）
- [ ] 印刷プレビューで編集UIが非表示になる
- [ ] 配色が水色ベースに統一されている
- [ ] `data-section` 属性値が全セクションで一意である
- [ ] メモの内容がすべてスライド構成に反映されている（情報の欠落がない）
- [ ] キーメッセージが簡潔な1文にまとめられている
