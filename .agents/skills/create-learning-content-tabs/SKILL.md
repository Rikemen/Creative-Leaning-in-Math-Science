---
name: create-learning-content-tabs
description: 学習コンテンツの index.html に「座学（Theory）」と「実装（Practice）」のタブUIを導入し、理論とコード実装の意図・結果を分けて解説するワークフロー。
---

# 学習コンテンツのタブ化（座学・実装）スキル

## 目的
抽象的な数学やアルゴリズムの学習コンテンツ（`index.html`）において、理論の解説と、それをコードでどう表現したか（実装）を分けて整理する。タブUIを用いて1つのページ内で綺麗に切り替えられるようにする。

## タブの構成要素

### 1. 📚 座学 (Theory) タブ
- **内容:** 定義、定理、数式による証明、モチベーション、具体例など。
- **特徴:** MathJaxを用いた数式表現（`\( ... \)` や `\[ ... \]`）を多用し、抽象的な数学の概念を解説する。既存の理論解説コンテンツは基本的にすべてこちらに格納する。

### 2. 💻 実装 (Practice) タブ
- **内容:** 
  1. **コード実装の意図:** なぜその数学的概念をコード（クラスや関数）として実装するのか、そのメリットや目的（例：ポリモーフィズムによる抽象化など）を解説する。
  2. **実装の要点:** 実際のコードの構造（クラス図、主要なメソッド、型の設計など）を解説する。
  3. **サンプル計算と結果の確認:** `sketch.js` 等で実行されるサンプルの計算内容と、開発者コンソール（または画面上）に出力されるべき期待値とその理由を記載する。
- **ルール:** 
  - 行列や多項式など、数学的なオブジェクトを解説する場合、JavaScriptのコード（配列表現: `[[1, 2], [3, 4]]` や `[1, 2, 1]` など）を書くだけでなく、**必ず MathJax を用いた数式表現（例: `\( \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix} \)` や `\( 1 + 2x + x^2 \)`）も併記する**こと。これにより、コードのデータ構造と数学的対象との対応関係を視覚的に分かりやすくする。
- **特徴:** 「作って学ぶ数学」のコンセプトに基づき、プログラミングの概念と数学の概念を紐づけることに重点を置く。

---

## 実装手順 (HTML/CSS/JS)

`index.html` に対して以下の構造とスタイルを組み込む。

### 1. CSSの追加 (`<style>` 内)
既存のスタイルに以下を追加する。既存のカラーパレット（`#0284c7` 等）があれば適宜合わせる。

```css
/* タブメニュー */
.tab-nav {
    display: flex;
    border-bottom: 2px solid #ced4da;
    margin-bottom: 30px;
    margin-top: 20px;
    gap: 10px;
}
.tab-btn {
    background: transparent;
    border: none;
    font-size: 16px;
    font-weight: bold;
    color: #6c757d;
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
}
.tab-btn:hover {
    color: #2c3e50;
    background-color: rgba(0,0,0,0.03);
    border-radius: 4px 4px 0 0;
}
.tab-btn.active {
    color: #0284c7; /* プライマリカラー */
    border-bottom: 3px solid #0284c7;
}

/* タブコンテンツ */
.tab-content {
    display: none;
}
.tab-content.active {
    display: block;
    animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### 2. HTML構造の追加 (`<body>` 内)
既存のコンテンツを囲む形でタブ構造を追加する。

```html
<h1>タイトル</h1>

<div class="tab-nav">
    <button class="tab-btn active" onclick="switchTab('theory')">📚 座学 (Theory)</button>
    <button class="tab-btn" onclick="switchTab('practice')">💻 実装 (Practice)</button>
</div>

<!-- ==================== 座学タブ ==================== -->
<div id="tab-theory" class="tab-content active">
    <!-- 既存の数学的解説や数式はすべてここに入れる -->
    <h2>1. モチベーション</h2>
    <p>...</p>
</div>

<!-- ==================== 実装タブ ==================== -->
<div id="tab-practice" class="tab-content">
    <h2>1. コード実装の意図</h2>
    <p>この実装では、数学における「〇〇」という概念を、プログラミングにおける「△△」を使って表現します。これにより...</p>
    
    <h2>2. 実装の要点</h2>
    <p>以下のようなクラス構造で実装を行います。</p>
    <ul>
        <li><code>ClassA</code>: ...</li>
    </ul>
    
    <h2>3. サンプル計算と結果の確認</h2>
    <div class="instruction">
        <strong>💡 確認方法:</strong> F12キーを押して開発者ツールの <b>Consoleタブ</b> を開き、以下の計算結果が出力されていることを確認してください。
    </div>
    <div class="column">
        <h4>どんな計算をしているか？</h4>
        <p>ここでは、〇〇と〇〇の計算をしています。</p>
        <h4>期待される出力結果</h4>
        <p>数学的には結果は〇〇になるはずなので、コンソールにも <code>[...]</code> と出力されます。</p>
    </div>
</div>
```

### 3. JavaScriptの追加 (`<script>` 内)
タブを切り替えるための簡単なスクリプトを記述する。

```javascript
function switchTab(tabId) {
    // 全てのタブボタンとコンテンツを非アクティブ化
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 選択されたタブをアクティブ化
    if(tabId === 'theory') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-theory').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-practice').classList.add('active');
    }
}
```

## 使用タイミング
ユーザーから「座学だけでなく、実装についての解説も追加して」「タブ分けして」と依頼があった場合や、抽象的な数学の概念をコードで表現する際に、理論とコードが混ざって分かりにくくなるのを防ぎたい場合に、このスキルを呼び出して `index.html` をリファクタリングする。
