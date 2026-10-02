/**
 * ベクトル空間における汎用的な線形結合を計算する関数
 * @param {VectorSpaceElement} v1 
 * @param {VectorSpaceElement} v2 
 * @param {number} a 
 * @param {number} b 
 * @returns {VectorSpaceElement} a*v1 + b*v2
 */
function calculateLinearCombination(v1, v2, a, b) {
    // 抽象化の威力：ここには「行列」か「多項式」かという具体的な情報はない！
    // どちらであっても、同じこのコードで動作する。
    return v1.scale(a).add(v2.scale(b));
}

function setup() {

    console.log("=== ベクトル空間のポリモーフィズム ===");
    console.log("同じ calculateLinearCombination 関数に、全く異なるオブジェクトを渡して計算します。");

    // ==========================================
    // 1. 行列の線形結合
    // ==========================================
    console.log("\\n--- 例1: 行列 (Matrix) の場合 ---");
    const m1 = new Matrix(2, 2);
    m1.set([[1, 2], [3, 4]]);
    const m2 = new Matrix(2, 2);
    m2.set([[0, 1], [1, 0]]);

    console.log("行列 m1:", m1.data);
    console.log("行列 m2:", m2.data);

    // 2*m1 + 3*m2 を計算
    // m1*2 = [[2, 4], [6, 8]], m2*3 = [[0, 3], [3, 0]]
    // 足すと [[2, 7], [9, 8]]
    const mResult = calculateLinearCombination(m1, m2, 2, 3);
    console.log("2*m1 + 3*m2 =", mResult.data);


    // ==========================================
    // 2. 多項式の線形結合
    // ==========================================
    console.log("\\n--- 例2: 多項式 (Polynomial) の場合 ---");
    // p1(x) = 1 + 2x + x^2
    const p1 = new Polynomial([1, 2, 1]);
    // p2(x) = 3 - x
    const p2 = new Polynomial([3, -1]);

    console.log("多項式 p1:", p1.toString());
    console.log("多項式 p2:", p2.toString());

    // 2*p1 + 3*p2 を計算
    // 2*p1 = 2 + 4x + 2x^2
    // 3*p2 = 9 - 3x
    // 足すと 11 + x + 2x^2
    const pResult = calculateLinearCombination(p1, p2, 2, 3);
    console.log("2*p1 + 3*p2 =", pResult.toString());

    console.log("\\n👉 行列と多項式という全く異なるデータ構造であっても、VectorSpaceElementを継承して共通のインターフェースを持つことで、同一の関数(calculateLinearCombination)で処理できることが確認できました！");
}

function draw() {
}
