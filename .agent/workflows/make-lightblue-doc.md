---
description: 水色ベースのデザイン（docs/systemdesign.html準拠）とインライン編集・JSON入出力を備えたHTMLドキュメントを生成するワークフロー
---

# 水色ベースHTMLドキュメント生成のワークフロー

## 目的

仕様書、設計書、レポートなどを、**水色ベースのライトテーマデザイン（docs/systemdesign.html 準拠）**で、かつ**1ファイル完結でインライン編集およびJSONエクスポート/インポートができる**HTMLとして生成する。

このワークフローで生成されたドキュメントは、以下の機能を初期状態で備えます。

- 各セクションに **「✏️ 編集」ボタン**。クリックでその場編集（`contenteditable="true"`）に切り替わる。
- 編集時の **「保存」「キャンセル」ボタン**。保存で確定、キャンセルで編集前の状態に復元。
- 画面右下のツールバーから **「JSONエクスポート」**。全セクションの内容を1つのJSONファイルとして出力。
- エクスポートしたJSONファイルを **「インポート」** することで、HTML本体の各セクションを再現・上書き保存。
- 印刷（PDF出力など）時には、編集ボタンやツールバーなどの編集用UIが自動的に非表示になる。

---

## 前提と原則

- **1ファイル完結**: CSS（`<style>`）およびJavaScript（`<script>`）はすべてHTML内にインラインで記述。ローカル環境 (`file://`) やオフラインでも完全に動作すること。
- **依存ライブラリの制限**: DOM操作はすべて素のJavaScript（Vanilla JS）で行い、外部のJSフレームワークに依存しない。
- **水色ベースデザイン**: ピンク等の恋愛風メルヘンカラーを避け、爽やかで知的な「水色 × 白 × 紺」の配色で構築する。
- **多言語対応**: UIの文言（ボタン等）やトースト通知は日本語を使用。`data-section` 属性値などの識別子は英語のケバブケース（例: `project-summary`）で定義。

---

## テンプレート構造

生成するHTMLファイルは、以下の `:root`、スタイル、HTML骨格、およびJavaScriptで構成します。

### 1. 既定の `:root` デザイントークン
`<style>` の冒頭に必ず以下の変数を組み込みます。

```css
:root {
  /* ===== Colors ===== */
  --color-primary: #0284c7; /* プライマリ水色 */
  --color-ink: #ffffff;
  --color-on-primary: #0f172a; /* 濃いネイビー（メイン文字色） */
  --color-on-primary-mute: #334155; /* スレートグレー（サブ文字色） */
  --color-canvas-night: #f0f9ff; /* 極薄の水色背景（外枠） */
  --color-canvas-night-soft: #ffffff; /* 純白背景（カード・セクション内枠） */
  --color-canvas-light: #ffffff;
  --color-canvas-cool: #e0f2fe;
  --color-hairline-on-dark: #bae6fd; /* 薄水色の境界線 */
  --color-hairline-on-light: #e0f2fe;
  --color-link-on-dark: #0284c7;
  --color-ink-mute: #64748b;

  /* ===== Typography ===== */
  --font-display: "D-DIN-Bold", "Arial Narrow", "Noto Sans JP", Arial, sans-serif;
  --font-body: "D-DIN", "Noto Sans JP", Arial, sans-serif;
  --font-mono: "Source Code Pro", monospace;

  --font-display-xxl-size: 28px;
  --font-display-xl-size: 22px;
  --font-display-lg-size: 17px;
  --font-body-lg-size: 15px;
  --font-body-md-size: 14px;
  --font-button-cap-size: 11px;
  --font-button-cap-tracking: 1.17px;

  /* ===== Radius ===== */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 32px;

  /* ===== Spacing ===== */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 18px;
  --space-xl: 24px;
  --space-xxl: 32px;
  --space-huge: 48px;

  --sidebar-width: 280px;
  --header-height: 56px;
}
```

### 2. 基本スタイルシート
水色ベースのライトテーマに準拠した基本スタイルです。

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--color-canvas-night);
  color: var(--color-on-primary);
  font-family: var(--font-body);
  font-size: var(--font-body-md-size);
  line-height: 1.7;
}

/* ヘッダー・サイドバー・フッターなどのレイアウト */
.site-header {
  position: fixed; top: 0; left: 0; right: 0; height: var(--header-height);
  background: rgba(240, 249, 255, 0.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-hairline-on-dark);
  display: flex; align-items: center; padding: 0 var(--space-xl); z-index: 100;
}
.sidebar {
  position: fixed; top: var(--header-height); left: 0; width: var(--sidebar-width);
  height: calc(100vh - var(--header-height)); overflow-y: auto;
  background: var(--color-canvas-night-soft); border-right: 1px solid var(--color-hairline-on-dark);
  padding: 20px 0; z-index: 90;
}
.main-content {
  margin-left: var(--sidebar-width); margin-top: var(--header-height);
  padding: var(--space-huge) var(--space-huge) 120px; max-width: 960px;
}

/* 編集可能セクションのスタイル */
.editable-section {
  position: relative; margin-bottom: var(--space-huge);
  background: var(--color-canvas-night-soft); padding: var(--space-xl);
  border-radius: var(--radius-md); border-bottom: 1px solid var(--color-hairline-on-dark);
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.05);
}
.editable-section.is-editing {
  outline: 2px solid var(--color-primary); background: var(--color-canvas-night);
}

/* 編集ボタン・アクション */
.edit-btn {
  position: absolute; top: var(--space-md); right: var(--space-md);
  background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill); font-family: var(--font-body); font-size: var(--font-button-cap-size);
  font-weight: 700; letter-spacing: var(--font-button-cap-tracking); text-transform: uppercase;
  padding: var(--space-xs) var(--space-md); cursor: pointer; opacity: 0.3; transition: all 0.15s;
}
.editable-section:hover .edit-btn { opacity: 1; }
.edit-btn:hover { background: var(--color-primary); color: var(--color-ink); }
.editable-section.is-editing .edit-btn { display: none; }

.edit-actions { display: none; gap: var(--space-sm); margin-top: var(--space-xl); }
.editable-section.is-editing .edit-actions { display: flex; }
.btn-save, .btn-cancel {
  border-radius: var(--radius-pill); border: 1px solid var(--color-primary);
  font-family: var(--font-body); font-size: var(--font-button-cap-size); font-weight: 700;
  padding: var(--space-xs) var(--space-lg); cursor: pointer; transition: all 0.15s;
}
.btn-save { background: var(--color-primary); color: var(--color-ink); }
.btn-cancel { background: transparent; color: var(--color-primary); opacity: 0.7; }

/* ツールバー & モーダル & トースト */
.floating-toolbar { position: fixed; bottom: var(--space-xl); right: var(--space-xl); display: flex; gap: var(--space-xs); z-index: 50; }
.toolbar-btn {
  background: rgba(255, 255, 255, 0.9); color: var(--color-primary); border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill); font-family: var(--font-body); font-size: var(--font-button-cap-size);
  font-weight: 700; padding: var(--space-xs) var(--space-md); cursor: pointer; backdrop-filter: blur(4px);
}
.modal { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: none; align-items: center; justify-content: center; z-index: 600; }
.modal.is-open { display: flex; }
.modal-body { background: var(--color-canvas-night-soft); border: 1px solid var(--color-hairline-on-dark); border-radius: var(--radius-md); padding: var(--space-xl); width: min(640px, 90vw); }
.modal-body textarea { width: 100%; min-height: 220px; background: var(--color-canvas-night); color: var(--color-on-primary); border: 1px solid var(--color-hairline-on-dark); border-radius: var(--radius-xs); padding: var(--space-md); font-family: var(--font-mono); font-size: 12px; }
.toast { position: fixed; bottom: var(--space-huge); left: 50%; transform: translateX(-50%) translateY(20px); background: rgba(15, 23, 42, 0.95); color: #ffffff; border: 1px solid var(--color-hairline-on-dark); border-radius: var(--radius-pill); padding: var(--space-xs) var(--space-lg); font-size: 12px; opacity: 0; transition: all 0.2s; z-index: 700; }
.toast.is-visible { opacity: 1; transform: translateX(-50%) translateY(0); }

/* 印刷時は編集UIを隠す */
@media print {
  .site-header, .sidebar, .floating-toolbar, .edit-btn, .edit-actions, .modal, .toast { display: none !important; }
  .main-content { margin-left: 0; padding: 0; max-width: 100%; }
  .editable-section { border-bottom: none; box-shadow: none; padding: 0; margin-bottom: var(--space-xxl); }
}
```

### 3. HTMLセクション構造
編集可能にするセクションはすべて以下のクラス名と属性パターンで配置します。

```html
<section class="editable-section" data-section="unique-section-key" id="sec-1">
  <button class="edit-btn" onclick="startEdit(this)">✏️ 編集</button>
  <div class="editable-content">
    <h2><span class="section-number">1</span>見出し</h2>
    <p>ここに本文を記述します。</p>
  </div>
  <div class="edit-actions">
    <button class="btn-cancel" onclick="cancelEdit(this)">キャンセル</button>
    <button class="btn-save" onclick="saveEdit(this)">💾 保存</button>
  </div>
</section>
```

### 4. JavaScript制御ロジック
ファイルの最下部にインライン `<script>` として以下の動作ロジックを貼り付けます。

```javascript
const editSnapshots = new Map();

function startEdit(buttonElement) {
  const section = buttonElement.closest('.editable-section');
  const content = section.querySelector('.editable-content');
  editSnapshots.set(section.dataset.section, content.innerHTML);
  content.setAttribute('contenteditable', 'true');
  section.classList.add('is-editing');
  content.focus();
}

function saveEdit(buttonElement) {
  const section = buttonElement.closest('.editable-section');
  const content = section.querySelector('.editable-content');
  content.removeAttribute('contenteditable');
  section.classList.remove('is-editing');
  editSnapshots.delete(section.dataset.section);
  showToast('保存しました', 'success');
}

function cancelEdit(buttonElement) {
  const section = buttonElement.closest('.editable-section');
  const content = section.querySelector('.editable-content');
  const snapshot = editSnapshots.get(section.dataset.section);
  if (snapshot !== undefined) {
    content.innerHTML = snapshot;
    editSnapshots.delete(section.dataset.section);
  }
  content.removeAttribute('contenteditable');
  section.classList.remove('is-editing');
  showToast('編集をキャンセルしました', 'info');
}

function exportJSON() {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    title: document.title,
    sections: {},
  };
  document.querySelectorAll('.editable-section').forEach((section) => {
    exportData.sections[section.dataset.section] = section.querySelector('.editable-content').innerHTML.trim();
  });
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `export_${new Date().getTime()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('JSONをエクスポートしました', 'success');
}

function openImportModal() {
  document.getElementById('importModal').classList.add('is-open');
  const textarea = document.getElementById('importTextarea');
  textarea.value = '';
  textarea.focus();
}
function closeImportModal() {
  document.getElementById('importModal').classList.remove('is-open');
}

function executeImport() {
  const jsonText = document.getElementById('importTextarea').value.trim();
  if (!jsonText) { showToast('JSONを入力してください', 'error'); return; }
  let importData;
  try {
    importData = JSON.parse(jsonText);
  } catch (e) {
    showToast('JSONの解析に失敗しました', 'error');
    return;
  }
  let updatedCount = 0;
  for (const [key, html] of Object.entries(importData.sections)) {
    const section = document.querySelector(`.editable-section[data-section="${key}"]`);
    if (!section) continue;
    section.querySelector('.editable-content').innerHTML = html;
    updatedCount += 1;
  }
  closeImportModal();
  showToast(`${updatedCount}セクションを更新しました`, 'success');
}

document.getElementById('importModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeImportModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeImportModal();
});

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} is-visible`;
  setTimeout(() => toast.classList.remove('is-visible'), 2500);
}
```

---

## チェックリスト（生成後に必ず自己検証）

- [ ] ローカル環境 (`file://`) またはオフラインで、HTMLファイルの表示およびインライン編集、JSONインポート/エクスポートがエラーなく動作すること。
- [ ] 各セクションに重複しない一意の `data-section` 属性値が割り当てられていること。
- [ ] 編集して「保存」で正しく確定され、「キャンセル」で編集前の状態に復元されること。
- [ ] エクスポートしたJSONを再度インポートし、表示が完全に上書きされること（往復可逆性）。
- [ ] 印刷プレビュー（`Ctrl+P` / `Cmd+P`）を開いたときに、編集ボタン、アクションボタン、ツールバー、トースト、モーダル等の編集UIがすべて非表示になっていること。
- [ ] 全体の配色が水色ベース（`#f0f9ff` 背景に `#0284c7` 等のプライマリカラー）に統一され、ピンクなどのメルヘンカラーが使用されていないこと。
