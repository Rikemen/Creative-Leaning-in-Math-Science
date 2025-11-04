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
                if (this.data[i][j] !== otherMatrix.data[i][j]) { // 修正: otherMatrix.dataを使用
                    return false; // 一致しない成分があれば行列は等しくない
                }
            }
        }
        return true;
    }
    /**
     * この行列が零行列かどうかを判定します。
     * @returns {boolean} 零行列の場合はtrue、そうでない場合はfalse
     */
    isZeroMatrix() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.data[i][j] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
    * この行列が正方行列かどうかを判定します。
     * @returns {boolean} 正方行列の場合はtrue、そうでない場合はfalse
    */
    isSquareMatrix() {
        if (this.rows === this.cols) {
            return true;
        } else {
            return false;
        }

    }
    /**
    * この行列が対角行列かどうかを判定します。
    * @returns {boolean} 対角行列の場合はtrue、そうでない場合はfalse
    */
    isDiagonalMatrix() {
        //正方行列でないなら対角行列でないので、正方行列かをまずはチェック
        if (!this.isSquareMatrix()) {
            return false;
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                //i≠jの場合だけ調べる
                if (i !== j && this.data[i][j] !== 0) {
                    return false;
                }

            }
        }
        return true; //全てのチェックを通過すれば対角行列
    }
    /**
    * この行列がスカラー行列かどうかを判定します。
    * @returns {boolean} スカラー行列の場合はtrue、そうでない場合はfalse
    */
    isScalarlMatrix() {
        //対角行列でないならスカラー行列でないので、対角行列かをまずはチェック
        if (!this.isDiagonalMatrix()) {
            return false;
        }
        let diagonalValue = this.data[0][0];//対角成分の代表の値として(1,1)成分を取得する
        for (let i = 0; i < this.rows; i++) {
            //i=jの場合だけ調べる、(1,1)成分と異なる成分があればスカラー行列でない
            if (this.data[i][i] !== diagonalValue) {
                return false;
            }
        }
        return true; //全てのチェックを通過すればスカラー行列
    }

    /**
    * この行列が単位行列かどうかを判定します。
    * @returns {boolean} 単位行列の場合はtrue、そうでない場合はfalse
    */
    isIdentityMatrix() {
        //対角行列でないならスカラー行列でないので、対角行列かをまずはチェック
        if (!this.isDiagonalMatrix()) {
            return false;
        }
        for (let i = 0; i < this.rows; i++) {
            //i=jの場合だけ調べる、1と異なる成分があれば単位行列でない
            if (this.data[i][i] !== 1) {
                return false;
            }
        }
        return true; //全てのチェックを通過すれば単位行列
    }
    /**
    * この行列が上三角行列かどうかを判定します。
    * @returns {boolean} 上三角行列の場合はtrue、そうでない場合はfalse
    */
    isUpperTriangularMatrix() {
        //正方行列でないなら三角行列でない
        if (!this.isSquareMatrix()) {
            console.log("not square matrix!")
            return false;
        }
        //下三角部分をチェック
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < i; j++) {
                //i > jの場合だけ調べる、0と異なる成分があれば上三角行列でない
                if (this.data[i][j] !== 0) {
                    return false;
                }

            }
        }
        return true;
    }
    /**
    * この行列が下三角行列かどうかを判定します。
    * @returns {boolean} 下三角行列の場合はtrue、そうでない場合はfalse
    */
    isLowerTriangularMatrix() {
        //正方行列でないなら三角行列でない
        if (!this.isSquareMatrix()) {
            console.log("not square matrix!")
            return false;
        }
        //上三角部分をチェック
        for (let i = 0; i < this.rows; i++) {
            for (let j = i + 1; j < this.cols; j++) {
                //i < jの場合だけ調べる、0と異なる成分があれば下三角行列でない
                if (this.data[i][j] !== 0) {
                    return false;
                }

            }
        }
        return true;
    }
    /**
     * この行列の転置行列を生成して戻します
     * @returns {Matrix} tranposedMatrix
     */
    transpose() {
        let transposedMatrix = new Matrix(this.cols, this.rows);
        let transposedData = [];
        for (let i = 0; i < this.cols; i++) {
            transposedData[i] = [];
            for (let j = 0; j < this.rows; j++) {
                transposedData[i][j] = this.data[j][i];
            }
        }
        transposedMatrix.set(transposedData);
        return transposedMatrix;
    }

    /**
    * この行列が対称行列かどうかを判定する
    * @returns {boolean} 下三角行列の場合はtrue、そうでない場合はfalse
    */
    isSymmetricMatrix() {
        //正方行列でないなら対象行列でない
        if (!this.isSquareMatrix()) {
            console.log("not square matrix!")
            return false;
        }
        let tranposedMatrix = this.transpose();
        return this.equals(tranposedMatrix);
    }

    /**
    * 和のスタティックメソッド(２つの行列を受け取り、和の行列を返す)
    * @param {Matrix} a - 和をとる片方の行列
    * @param {Matrix} b - 和をとる片方の行列
    * @returns {Matrix} result 
    */
    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw new Error("行列のサイズが一致しません。");
        }

        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] + b.data[i][j];
            }
        }

        return result;
    }

    /** 
    * 和のインスタンスメソッド(この行列に別の行列を加える)
    * @param {Matrix} other - この行列に加える行列
    * @returns {Matrix} result 
    */

    add(other) {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error(`行列のサイズが一致しません。行列aは ${this.rows}x${this.cols}、行列bは ${other.rows}x${other.cols} です。`);
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] += other.data[i][j];
            }
        }
        return this; // メソッドチェーンを可能にするために自身を返す
    }

    /**
    * スカラー倍のスタティックメソッド(スカラーと行列を受け取り、スカラー倍した行列を返す)
    * @param {number} c - スカラー
    * @param {Matrix} matrix - スカラー倍する行列
    * @returns {Matrix} result 
    */
    static scale(matrix, c) {
        const result = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[i][j] = c * matrix.data[i][j];
            }
        }

        return result;
    }

    /** 
    * スカラー倍のインスタンスメソッド(この行列をスカラー倍する)
    * @param {number} c - スカラー
    * @returns {Matrix} result 
    */
    scale(c) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = c * this.data[i][j];
            }
        }
        return this
    }



}

