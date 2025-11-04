class BlockMatrix {
    /**
     * ブロック行列を作成します。
     * @param {Array<Array<Matrix>>} blocks - ネストされたMatrixオブジェクトの配列
     */
    constructor(blocks) {
        this.blocks = blocks;
        this.rowBlocks = blocks.length; // ブロック行数
        this.colBlocks = blocks[0].length; // ブロック列数

        // 各ブロックのサイズを取得（全てのブロックが同じサイズであることを仮定）
        this.blockRows = blocks[0][0].rows;
        this.blockCols = blocks[0][0].cols;

        // 全体の行列サイズを計算
        this.rows = this.rowBlocks * this.blockRows;
        this.cols = this.colBlocks * this.blockCols;
    }

    /**
     * ブロック行列を通常のMatrix形式に変換します。
     * @returns {Matrix} 通常の行列形式
     */
    toMatrix() {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rowBlocks; i++) {
            for (let j = 0; j < this.colBlocks; j++) {
                const block = this.blocks[i][j];
                for (let bi = 0; bi < block.rows; bi++) {
                    for (let bj = 0; bj < block.cols; bj++) {
                        result.data[i * this.blockRows + bi][j * this.blockCols + bj] = block.data[bi][bj];
                    }
                }
            }
        }
        return result;
    }

    /**
     * 通常のMatrix形式からブロック行列を生成します。
     * @param {Matrix} matrix - 通常の行列
     * @param {number} blockRows - ブロックの行サイズ
     * @param {number} blockCols - ブロックの列サイズ
     * @returns {BlockMatrix} ブロック行列
     */
    static fromMatrix(matrix, blockRows, blockCols) {
        // 行列サイズが割り切れない場合にエラーをスロー
        if (matrix.rows % blockRows !== 0 || matrix.cols % blockCols !== 0) {
            throw new Error(`Matrix dimensions (${matrix.rows}x${matrix.cols}) do not divide evenly into blocks of size (${blockRows}x${blockCols}).`);
        }

        const blocks = [];
        const rowBlocks = matrix.rows / blockRows;
        const colBlocks = matrix.cols / blockCols;

        for (let i = 0; i < rowBlocks; i++) {
            blocks[i] = [];
            for (let j = 0; j < colBlocks; j++) {
                const block = new Matrix(blockRows, blockCols);
                for (let bi = 0; bi < blockRows; bi++) {
                    for (let bj = 0; bj < blockCols; bj++) {
                        const globalRow = i * blockRows + bi;
                        const globalCol = j * blockCols + bj;
                        block.data[bi][bj] = matrix.data[globalRow][globalCol];
                    }
                }
                blocks[i][j] = block;
            }
        }

        return new BlockMatrix(blocks);
    }
    /**
     * 他のブロック行列との積を計算します。
     * @param {BlockMatrix} other - 他のブロック行列
     * @returns {BlockMatrix} 積のブロック行列
     */
    multiply(other) {
        if (this.colBlocks !== other.rowBlocks) {
            throw new Error("ブロック行列のサイズが一致しません。");
        }

        const resultBlocks = [];
        for (let i = 0; i < this.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < other.colBlocks; j++) {
                let sum = new Matrix(this.blockRows, this.blockCols);
                for (let k = 0; k < this.colBlocks; k++) {
                    const product = Matrix.multiplyMatrices(this.blocks[i][k], other.blocks[k][j]);
                    sum = Matrix.add(sum, product);
                }
                resultBlocks[i][j] = sum;
            }
        }
        return new BlockMatrix(resultBlocks);
    }

    /**
     * 他のブロック行列との積を計算します。
     * @param {BlockMatrix} a - 第一のブロック行列
     * @param {BlockMatrix} b - 第二のブロック行列
     * @returns {BlockMatrix} 積のブロック行列
     */
    static multiplyStatic(a, b) {
        if (a.colBlocks !== b.rowBlocks) {
            throw new Error("ブロック行列のサイズが一致しません。");
        }

        const resultBlocks = [];
        for (let i = 0; i < a.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < b.colBlocks; j++) {
                let sum = new Matrix(a.blockRows, b.blockCols);
                for (let k = 0; k < a.colBlocks; k++) {
                    const product = Matrix.multiplyMatrices(a.blocks[i][k], b.blocks[k][j]);
                    sum = Matrix.add(sum, product);
                }
                resultBlocks[i][j] = sum;
            }
        }
        return new BlockMatrix(resultBlocks);
    }
    /**
     * 他のブロック行列との和を計算します。
     * @param {BlockMatrix} other - 他のブロック行列
     * @returns {BlockMatrix} 和のブロック行列
     */
    add(other) {
        if (this.rowBlocks !== other.rowBlocks || this.colBlocks !== other.colBlocks) {
            throw new Error("ブロック行列のサイズが一致しません。");
        }
    
        const resultBlocks = [];
        for (let i = 0; i < this.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < this.colBlocks; j++) {
                resultBlocks[i][j] = Matrix.add(this.blocks[i][j], other.blocks[i][j]);
            }
        }
        return new BlockMatrix(resultBlocks);
    }

    /**
     * 静的メソッド: 他のブロック行列との和を計算します。
     * @param {BlockMatrix} a - 第一のブロック行列
     * @param {BlockMatrix} b - 第二のブロック行列
     * @returns {BlockMatrix} 和のブロック行列
     */
    static addStatic(a, b) {
        if (a.rowBlocks !== b.rowBlocks || a.colBlocks !== b.colBlocks) {
            throw new Error("ブロック行列のサイズが一致しません。");
        }
    
        const resultBlocks = [];
        for (let i = 0; i < a.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < a.colBlocks; j++) {
                resultBlocks[i][j] = Matrix.add(a.blocks[i][j], b.blocks[i][j]);
            }
        }
        return new BlockMatrix(resultBlocks);
    }
    /**
     * ブロック行列をスケールします。
     * @param {number} c - スケール係数
     * @returns {BlockMatrix} スケールされたブロック行列
     */
    scale(c) {
        const resultBlocks = [];
        for (let i = 0; i < this.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < this.colBlocks; j++) {
                resultBlocks[i][j] = this.blocks[i][j].scale(c);
            }
        }
        return new BlockMatrix(resultBlocks);
    }

    /**
     * 静的メソッド: ブロック行列をスケールします。
     * @param {BlockMatrix} blockMatrix - スケールするブロック行列
     * @param {number} c - スケール係数
     * @returns {BlockMatrix} スケールされたブロック行列
     */
    static scaleStatic(blockMatrix, c) {
        const resultBlocks = [];
        for (let i = 0; i < blockMatrix.rowBlocks; i++) {
            resultBlocks[i] = [];
            for (let j = 0; j < blockMatrix.colBlocks; j++) {
                resultBlocks[i][j] = Matrix.scaleStatic(blockMatrix.blocks[i][j], c);
            }
        }
        return new BlockMatrix(resultBlocks);
    }

    /**
     * ブロック行列を転置します。
     * @returns {BlockMatrix} 転置されたブロック行列
     */
    transpose() {
        const transposedBlocks = [];
        for (let i = 0; i < this.colBlocks; i++) {
            transposedBlocks[i] = [];
            for (let j = 0; j < this.rowBlocks; j++) {
                transposedBlocks[i][j] = this.blocks[j][i].transpose();
            }
        }
        return new BlockMatrix(transposedBlocks);
    }

    /**
     * 静的メソッド: ブロック行列を転置します。
     * @param {BlockMatrix} blockMatrix - 転置するブロック行列
     * @returns {BlockMatrix} 転置されたブロック行列
     */
    static transposeStatic(blockMatrix) {
        const transposedBlocks = [];
        for (let i = 0; i < blockMatrix.colBlocks; i++) {
            transposedBlocks[i] = [];
            for (let j = 0; j < blockMatrix.rowBlocks; j++) {
                transposedBlocks[i][j] = Matrix.transposeStatic(blockMatrix.blocks[j][i]);
            }
        }
        return new BlockMatrix(transposedBlocks);
    }

}
