---
name: svg-diagram-guidelines
description: >-
  Use this skill when creating or modifying SVG diagrams, flowcharts, or visual layouts containing Japanese text. It provides critical guidelines to prevent text overflow and ensures responsive and robust layouts across different browser environments.
---

# SVG Diagram Guidelines (Japanese Text)

SVG（特にフローチャートや図解）を生成・修正する際、環境によるフォントレンダリングの差異によって「日本語テキストが図形や画面からはみ出す」という問題が頻発します。これを防ぐために以下のガイドラインを必ず遵守してください。

## 1. viewBox は十分に余裕を持たせる
*   **問題**: ブラウザのフォントサイズやシステムフォントの違いにより、日本語テキストは想定よりも横幅を大きく取ることがあります。
*   **対策**: `viewBox` の横幅はギリギリを攻めず、非常に余裕を持たせたサイズ（例: 4ステップのフローチャートなら `viewBox="0 0 800 280"` など）を設定してください。

## 2. 図形（rect, polygon）の幅は想定の 1.5倍 以上
*   **問題**: 文字数ピッタリに合わせて `<rect>` や `<polygon>` の幅を指定すると、環境によっては文字が枠外にはみ出します。
*   **対策**: 
    *   長方形 (`<rect>`): 予想されるテキスト幅に対して、左右にたっぷりと余白（パディング）を持たせた幅を設定してください。
    *   ひし形 (`<polygon>`): フローチャートの条件分岐などで使うひし形は、上下の頂点付近で幅が狭くなるため、**テキスト幅の2倍近い幅（例: 15文字なら横幅300px〜400px）** を確保してください。

## 3. text-anchor="middle" の徹底
*   テキストを配置する際は、左揃えで微調整するのではなく、必ず図形の中心のX座標を指定し `text-anchor="middle"` を使用してください。これによりフォントサイズがブレても中央に留まります。

## 4. 適切なフォントサイズ
*   視認性を高めるため、極端に小さいフォントサイズ（`10` など）は避け、`12` 〜 `14` 程度を基本としてください。それに合わせて図形や viewBox のスケールを大きくしてください。
