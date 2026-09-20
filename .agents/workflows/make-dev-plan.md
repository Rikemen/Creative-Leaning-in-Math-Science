---
description: 実装計画を水色ベースデザインの1ファイルHTMLとして生成する。サイドバー目次・ステータス管理付きタスクテーブル・インライン編集・JSON入出力を備える。
---

# 実装計画HTMLドキュメント生成ワークフロー

## 目的

開発の実装計画を **水色ベースのライトテーマ** で **1ファイル完結** のHTMLとして生成する。

**実装例**: `docs/dev-plan.html` を参照。

## 出力先の命名規則

生成するHTMLファイルは `docs/dev-plans/` ディレクトリに配置する。ファイル名は **依頼された機能名・計画名を英語に変換** し、`kebab-case` で命名したうえで、**生成日の日付サフィックス** を付与する。

### ルール

1. ユーザーから依頼された機能名・計画名を **簡潔な英語** に翻訳する
2. 英語タイトルを **kebab-case**（小文字・ハイフン区切り）に変換する
3. 生成日を `YYYYMMDD` 形式で取得する
4. 出力先を `docs/dev-plans/{kebab-case-title}-{YYYYMMDD}.html` とする
5. `docs/dev-plans/` ディレクトリが存在しない場合は作成する
6. 既存の同名ファイルがある場合は上書き前に確認する

### 命名例

| 依頼内容 | ファイル名（2026年6月14日に生成した場合） |
|---|---|
| ユーザー認証機能の実装計画 | `docs/dev-plans/user-authentication-20260614.html` |
| チャット画面のリファクタリング | `docs/dev-plans/chat-screen-refactoring-20260614.html` |
| 通知システムの設計 | `docs/dev-plans/notification-system-design-20260614.html` |
| Firestoreセキュリティルール整備 | `docs/dev-plans/firestore-security-rules-20260614.html` |

## ベース仕様

**デザイントークン・基本スタイル・編集JS・モーダル・トースト** は `/make-lightblue-doc` ワークフロー（`.agent/workflows/make-lightblue-doc.md`）の仕様に **完全準拠** する。本ワークフローでは、それに加える **実装計画固有の差分** のみを定義する。

---

## 実装計画固有の機能

### 1. サイドバー目次（左固定ナビゲーション）

- 左固定 `width: 280px`。スクロール連動で現在セクションをハイライト（`.active` クラス付与）。
- モバイル（860px以下）ではハンバーガーメニューで開閉。オーバーレイ付き。

```html
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<aside class="sidebar" id="sidebar">
  <span class="sidebar__label">目次</span>
  <ul class="sidebar__nav" id="sidebarNav">
    <li><a href="#sec-overview">概要</a></li>
    <li><a href="#sec-phase1">Phase 1: ...</a></li>
    <!-- Phase数だけ追加 -->
    <li><a href="#sec-rules">開発の進め方ルール</a></li>
  </ul>
</aside>
```

**ヘッダー**: プロジェクト名 + `DEVELOPMENT PLAN` バッジ。ハンバーガーボタン付き。

### 2. ステータス管理付きタスクテーブル

各Phaseセクション内に配置。各タスク行にセレクトボックスを設け、値に応じて色が動的に変化する。

```html
<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th style="width:100px;">ステータス</th>
        <th style="width:80px;">タスクID</th>
        <th style="width:250px;">タスク内容 (約15分)</th>
        <th>具体的な実装内容 ＆ 確認手順</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <select class="status-select">
            <option value="未着手" selected>未着手</option>
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
            <option value="保留">保留</option>
          </select>
        </td>
        <td><strong>Task X.Y</strong></td>
        <td>タスク名</td>
        <td>実装内容。<code>ファイルパス</code>や手順。</td>
      </tr>
    </tbody>
  </table>
</div>
```

**ステータスの色分けJS**（必須）:

```javascript
function applySelectColor(select) {
  const map = {
    '完了':  { border: '#16a34a', color: '#16a34a', bg: '#dcfce7' },
    '進行中': { border: '#0284c7', color: '#0284c7', bg: '#e0f2fe' },
    '保留':  { border: '#d97706', color: '#d97706', bg: '#fef3c7' },
  };
  const s = map[select.value] || { border: '#cbd5e1', color: '#64748b', bg: '#f1f5f9' };
  select.style.borderColor = s.border;
  select.style.color = s.color;
  select.style.background = s.bg;
}
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('status-select')) applySelectColor(e.target);
});
document.querySelectorAll('.status-select').forEach(applySelectColor);
```

### 3. サイドバーJS（必須）

```javascript
(function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle  = document.getElementById('menuToggle');
  const navLinks = document.querySelectorAll('#sidebarNav a');

  function open()  { sidebar.classList.add('open'); overlay.classList.add('open'); }
  function close() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }
  toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  navLinks.forEach(l => l.addEventListener('click', () => { if (innerWidth <= 860) close(); }));

  // スクロール連動アクティブ
  const secs = [];
  navLinks.forEach(l => {
    const el = document.getElementById(l.getAttribute('href').replace('#',''));
    if (el) secs.push({ link: l, element: el });
  });
  function update() {
    const top = scrollY + 80;
    let cur = secs[0];
    for (const s of secs) { if (s.element.offsetTop <= top) cur = s; }
    navLinks.forEach(l => l.classList.remove('active'));
    if (cur) cur.link.classList.add('active');
  }
  let tick = false;
  addEventListener('scroll', () => {
    if (!tick) { requestAnimationFrame(() => { update(); tick = false; }); tick = true; }
  });
  update();
})();
```

### 4. エクスポート時のステータス同期

`exportJSON()` 内で Blob 生成の **直前** に、select の選択状態を DOM 属性に同期する処理を追加する。また `cancelEdit()` の innerHTML 復元後に `applySelectColor` を再実行する。

```javascript
// exportJSON() 内に追加
document.querySelectorAll('.status-select').forEach(select => {
  Array.from(select.options).forEach(opt => {
    opt.value === select.value ? opt.setAttribute('selected','selected') : opt.removeAttribute('selected');
  });
});

// cancelEdit() の末尾に追加
section.querySelectorAll('.status-select').forEach(applySelectColor);
```

---

## 実装計画固有のCSS（追加分）

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

/* ステータスセレクト */
.status-select { background:var(--color-canvas-night); color:var(--color-on-primary); border:1px solid var(--color-hairline-on-dark); border-radius:var(--radius-pill); font-size:11px; font-weight:700; padding:2px 8px; cursor:pointer; outline:none; transition:all 0.15s; }
.status-select:hover { border-color:var(--color-primary); }

/* 注意ボックス */
.callout { border:1px solid var(--color-hairline-on-dark); background:var(--color-canvas-night); border-radius:var(--radius-sm); padding:var(--space-md) var(--space-lg); margin-bottom:var(--space-xl); font-size:13px; line-height:1.6; border-left:3px solid var(--color-primary); }
.callout strong { font-weight:700; color:var(--color-primary); }

/* ヒーロー */
.hero-banner { padding:var(--space-xl) 0 var(--space-xs); margin-bottom:var(--space-sm); }
.hero-banner h1 { font-family:var(--font-display); font-size:var(--font-display-xxl-size); line-height:1.2; font-weight:700; margin-bottom:var(--space-xs); color:var(--color-primary); text-transform:uppercase; }
.hero-banner p { font-size:var(--font-body-lg-size); color:var(--color-on-primary-mute); }

/* 印刷時の追加 */
@media print { .status-select { border:none; background:transparent; padding:0; pointer-events:none; color:inherit!important; } }
```

---

## コンテンツ生成ルール

- **タスク粒度**: 1タスク約15分。各タスクに「実装内容」と「確認手順」を記載。
- **Phase分割**: 機能の論理的まとまりでグループ化。3〜6個が理想。
- **タスクID**: `Task {Phase}.{連番}`（例: `Task 1.1`）。Phase内で1から開始。
- **ステータス初期値**: 新規生成時はすべて `未着手`。進捗反映はユーザー指示時のみ。
- **出力先**: 「出力先の命名規則」セクションに従い、`docs/dev-plans/{英語kebab-case}-{YYYYMMDD}.html` に出力する。既存ファイルがある場合は上書き前に確認。
- **コミット境界**: 実装計画には必ず「ブランチ・コミット戦略」または各Phase内のコミットタスクを含める。複数機能を扱う計画では、機能・認可/ルール・UI・テスト・リファクタリングを混ぜず、戻しやすい小さなコミット単位を明記する。ユーザーが「やり直しできるように」「細かくコミット」「戻れるように」と依頼した場合は、各Phaseの末尾に想定コミットメッセージと戻し方（例: `git revert <commit>`）を記載する。

---

## 検証方法

> **ブラウザサブエージェントによる自動確認は不要。** 生成後のHTML表示確認はユーザー自身が `file://` で開いて目視確認する運用とする。エージェントは HTML ファイルの生成完了をもってタスク完了とし、`browser_subagent` ツールを呼び出さないこと。

---

## チェックリスト

- [ ] `file://` でエラーなく表示される
- [ ] サイドバー目次リンクが正しくスクロールし、アクティブ項目がハイライトされる
- [ ] モバイル幅でハンバーガーメニューが動作する
- [ ] ステータス変更時に色が動的に変わる（完了=緑, 進行中=青, 保留=黄, 未着手=灰）
- [ ] インライン編集の保存・キャンセルが正しく動作する
- [ ] JSONエクスポート/インポートが往復可逆（ステータス値も含む）
- [ ] 印刷プレビューで編集UIが非表示になる
- [ ] 配色が水色ベースに統一されている
- [ ] `data-section` 属性値が全セクションで一意である
