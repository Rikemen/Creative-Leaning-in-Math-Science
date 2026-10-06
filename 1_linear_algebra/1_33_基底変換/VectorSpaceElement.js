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
     * 与えられたベクトル空間の要素群が生成する（張る）空間の次元を計算します。
     * 行列の階数（Rank）を求めることで、一次独立なベクトルの最大個数がわかります。
     * @param {Array<VectorSpaceElement>} elements
     * @returns {number}
     */
    static getDimension(elements) {
        if (!elements || elements.length === 0) return 0;

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
        let matrix = new Matrix(vectors.length, maxDim);
        matrix.set(vectors);
        
        // 4. 行列のランク（階段行列のゼロでない行の数）を計算し、それが次元となる
        return matrix.rank();
    }

    /**
     * 与えられたベクトル空間の要素群が一次独立かどうかを判定します。
     * @param {Array<VectorSpaceElement>} elements
     * @returns {boolean}
     */
    static isLinearlyIndependent(elements) {
        if (!elements || elements.length === 0) return true;
        // ランク（次元）が要素数と一致していれば、ムダなベクトルがなく一次独立
        return this.getDimension(elements) === elements.length;
    }

    /**
     * 与えられたベクトル空間の要素群が、指定した次元の空間の「基底」であるかを判定します。
     * @param {Array<VectorSpaceElement>} elements
     * @param {number} spaceDimension - 対象となる空間全体の次元数（例: R^3なら3）
     * @returns {boolean}
     */
    static isBasis(elements, spaceDimension) {
        if (!elements) return false;
        // 定理: 「要素の個数 == 空間の次元」かつ「ランク == 空間の次元」であれば基底である
        if (elements.length !== spaceDimension) return false; // 個数が合わないなら基底になり得ない
        return this.getDimension(elements) === spaceDimension;
    }
    /**
     * 与えられた2つの基底から基底変換行列 P を生成します。
     * @param {Array<VectorSpaceElement>} newBasis - 変換後の新しい基底
     * @param {Array<VectorSpaceElement>|null} oldBasis - 変換前の古い基底（省略時は標準基底とみなす）
     * @returns {Matrix} 基底変換行列 P
     */
    static getChangeOfBasisMatrix(newBasis, oldBasis = null) {
        if (!newBasis || newBasis.length === 0) {
            throw new Error("新しい基底が指定されていません。");
        }

        // ベクトル群を列ベクトルとして並べた行列を作成するヘルパー関数
        const createMatrixFromBasis = (basis) => {
            const vectors = basis.map(e => e.toArray());
            const rows = vectors[0].length;
            const cols = basis.length;
            const matrix = new Matrix(rows, cols);
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    matrix.data[i][j] = vectors[j][i];
                }
            }
            return matrix;
        };

        const eNew = createMatrixFromBasis(newBasis);

        // oldBasisが省略された場合は、標準基底からの変換とみなし、eNewをそのまま変換行列とする
        if (!oldBasis) {
            return eNew;
        }

        const eOld = createMatrixFromBasis(oldBasis);
        
        // P = (E_old)^(-1) * (E_new)
        const eOldInv = eOld.inverse();
        return Matrix.multiplyMatrices(eOldInv, eNew);
    }
}
