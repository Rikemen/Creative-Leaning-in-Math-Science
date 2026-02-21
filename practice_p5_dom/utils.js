/**
 * p5.jsのDOM要素にCSSスタイルをオブジェクト形式で一括適用する関数
 * @param {p5.Element} element - スタイルを当てたい要素
 * @param {Object} styles - CSSプロパティと値のオブジェクト
 */
export function applyStyles(element, styles) {
    for (const property in styles) {
        element.style(property, styles[property]);
    }
}