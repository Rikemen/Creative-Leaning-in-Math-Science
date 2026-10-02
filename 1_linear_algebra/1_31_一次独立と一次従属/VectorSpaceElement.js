/**
 * ベクトル空間の要素（VectorSpace Element）が満たすべき共通インターフェース
 * ポリモーフィズムを実現するための親クラスです。
 */
class VectorSpaceElement {
    /**
     * 加法（足し算）
     * @param {VectorSpaceElement} other
     * @returns {VectorSpaceElement}
     */
    add(other) {
        throw new Error("add(other) メソッドを実装してください");
    }
    
    /**
     * スカラー乗法（定数倍）
     * @param {number} scalar
     * @returns {VectorSpaceElement}
     */
    scale(scalar) {
        throw new Error("scale(scalar) メソッドを実装してください");
    }

    /**
     * 自身を1次元の数ベクトル（配列）に変換します。
     * @returns {Array<number>}
     */
    toArray() {
        throw new Error("toArray() メソッドを実装してください");
    }

    /**
     * 与えられたベクトル空間の要素群が一次独立かどうかを判定します。
     * @param {Array<VectorSpaceElement>} elements
     * @returns {boolean}
     */
    static isLinearlyIndependent(elements) {
        if (!elements || elements.length === 0) return true;

        // 1. 各要素を数ベクトル（1次元配列）に変換
        let vectors = elements.map(e => e.toArray());
        
        // 2. 次元の最大値を求め、すべてのベクトルを同じ長さに揃える（足りない次元は0で埋める）
        let maxDim = Math.max(...vectors.map(v => v.length));
        vectors = vectors.map(v => {
            let padded = [...v];
            while (padded.length < maxDim) padded.push(0);
            return padded;
        });

        // 3. ベクトルを行として並べた行列を作成する
        // （行列のランクは行階数＝列階数なので、行として並べても判定結果は同じです）
        let matrix = new Matrix(vectors.length, maxDim);
        matrix.set(vectors);
        
        // 4. 行列のランク（階段行列のゼロでない行の数）を計算
        let rank = matrix.rank();
        
        // 5. ランクがベクトルの本数と一致していれば一次独立
        return rank === elements.length;
    }
}
