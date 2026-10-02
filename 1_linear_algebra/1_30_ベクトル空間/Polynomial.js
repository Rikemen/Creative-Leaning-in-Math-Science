/**
 * Polynomialクラスは、1変数多項式の操作を提供します。
 * ベクトル空間の要素として、加法とスカラー倍を実装します。
 */
class Polynomial extends VectorSpaceElement {
    /**
     * @param {Array<number>} coefficients - 係数の配列。[定数項, xの係数, x^2の係数, ...]
     */
    constructor(coefficients) {
        super();
        this.coefficients = coefficients || [];
        this.clean(); // 末尾の0を取り除く（例: [1, 2, 0] -> [1, 2]）
    }

    clean() {
        while (this.coefficients.length > 0 && this.coefficients[this.coefficients.length - 1] === 0) {
            this.coefficients.pop();
        }
    }

    /**
     * 多項式同士の足し算
     * @param {Polynomial} other
     * @returns {Polynomial}
     */
    add(other) {
        if (!(other instanceof Polynomial)) {
            throw new Error("Polynomial以外のオブジェクトは足せません");
        }
        let maxLen = Math.max(this.coefficients.length, other.coefficients.length);
        let result = [];
        for (let i = 0; i < maxLen; i++) {
            let c1 = this.coefficients[i] || 0;
            let c2 = other.coefficients[i] || 0;
            result.push(c1 + c2);
        }
        return new Polynomial(result);
    }

    /**
     * 多項式のスカラー倍
     * @param {number} scalar
     * @returns {Polynomial}
     */
    scale(scalar) {
        let result = this.coefficients.map(c => c * scalar);
        return new Polynomial(result);
    }

    /**
     * 多項式を文字列で返す
     * @returns {string}
     */
    toString() {
        if (this.coefficients.length === 0) return "0";
        let terms = [];
        for (let i = 0; i < this.coefficients.length; i++) {
            let c = this.coefficients[i];
            if (c === 0) continue;
            let term = "";
            if (i === 0) {
                term = `${c}`;
            } else if (i === 1) {
                term = c === 1 ? "x" : c === -1 ? "-x" : `${c}x`;
            } else {
                term = c === 1 ? `x^${i}` : c === -1 ? `-x^${i}` : `${c}x^${i}`;
            }
            terms.push(term);
        }
        // 次数の大きい順に並べ替えて結合
        return terms.reverse().join(" + ").replace(/\+ -/g, "- ");
    }
}
