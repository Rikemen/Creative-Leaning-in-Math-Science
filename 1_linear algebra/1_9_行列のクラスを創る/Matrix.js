/**
 * Matrixクラスは、行列の基本操作を提供します。
 */
class Matrix {
    /**
     * 行と列のサイズを指定してMatrixを作成します。
     * @param {number} rows - 行数
     * @param {number} cols - 列数
     */
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        // 行列を0で初期化する
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = 0;
            }
        }
    }

    /**
     * 任意のデータを行列にセットします。
     * @param {Array<Array<number>>} data - セットするデータ（行列形式）
     * @throws {Error} データのサイズが行列のサイズと一致しない場合
     */
    set(data) {
        if (data.length !== this.rows || data[0].length !== this.cols) {
            console.error("データのサイズが行列のサイズと一致していません。");
            return;
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = data[i][j];
            }
        }
    }

    /**
     * 指定した行のデータを取得します。
     * @param {number} i - 行のインデックス
     * @returns {Array<number>} i行目のデータ
     * @throws {Error} インデックスが範囲外の場合
     */
    getRow(i) {
        if (i >= this.rows || i < 0) {
            console.error("指定されたインデックスは範囲外です");
            return undefined;
        } else {
            return this.data[i];
        }
    }

    /**
     * 指定した列のデータを取得します。
     * @param {number} j - 列のインデックス
     * @returns {Array<number>} j列目のデータ
     * @throws {Error} インデックスが範囲外の場合
     */
    getColumn(j) {
        if (j >= this.cols || j < 0) {
            console.error("指定されたインデックスは範囲外です");
            return undefined;
        } else {
            let col = [];
            for (let i = 0; i < this.rows; i++) {
                col.push(this.data[i][j]);
            }
            return col;
        }
    }

    /**
     * 行列の特定の(i, j)成分を取得します。
     * @param {number} i - 行のインデックス
     * @param {number} j - 列のインデックス
     * @returns {number} (i, j)成分の値
     * @throws {Error} インデックスが範囲外の場合
     */
    getElement(i, j) {
        if (i >= this.rows || i < 0 || j >= this.cols || j < 0) {
            console.error("指定されたインデックスは範囲外です");
            return undefined;
        } else {
            let element = this.data[i][j];
            return element;
        }
    }

    /**
     * この行列が他の行列と等しいかどうかを判定します。
     * @param {Matrix} otherMatrix - 比較対象の行列
     * @returns {boolean} 行列が等しい場合はtrue、そうでない場合はfalse
     */
    equals(otherMatrix) {
        if (this.rows !== otherMatrix.rows || this.cols !== otherMatrix.cols) {
            return false; // 型が一致しない行列は等しくない
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.data[i][j] !== otherMatrix.data[i][j]) { 
                    return false; // 一致しない成分があれば行列は等しくない
                }
            }
        }
        return true;
    }
}
