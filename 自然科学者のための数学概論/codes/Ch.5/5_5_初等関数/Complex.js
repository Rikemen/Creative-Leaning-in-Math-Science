class Complex {
    /**
     * Complexクラスの新しいインスタンスを作成します。
     * @param {number} re - 複素数の実部。
     * @param {number} im - 複素数の虚部。
     */
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    /**
     * 現在の複素数に別の複素数または実数を加算します。
     * @param {(Complex|number)} c - 加算する複素数または実数。
     * @returns {Complex} - 和を表す新しいComplexインスタンス。
     */
    add(c) {
        if (c instanceof Complex) {
            return new Complex(this.re + c.re, this.im + c.im);
        }
        return new Complex(this.re + c, this.im);
    }

    /**
     * 現在の複素数から別の複素数または実数を減算します。
     * @param {(Complex|number)} c - 減算する複素数または実数。
     * @returns {Complex} - 差を表す新しいComplexインスタンス。
     */
    sub(c) {
        if (c instanceof Complex) {
            return new Complex(this.re - c.re, this.im - c.im);
        }
        return new Complex(this.re - c, this.im);
    }

    /**
     * 現在の複素数に別の複素数または実数を乗算します。
     * @param {(Complex|number)} c - 乗算する複素数または実数。
     * @returns {Complex} - 積を表す新しいComplexインスタンス。
     */
    mult(c) {
        if (c instanceof Complex) {
            return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re);
        }
        return new Complex(this.re * c, this.im * c);
    }

    /**
     * 現在の複素数を別の複素数または実数で除算します。
     * @param {(Complex|number)} c - 除算する複素数または実数。
     * @returns {Complex} - 商を表す新しいComplexインスタンス。
     * @throws {Error} - 除数がゼロの場合。
     */
    div(c) {
        if (c instanceof Complex) {
            const denom = c.re * c.re + c.im * c.im;
            if (denom === 0) {
                throw new Error("Cannot divide by zero value.");
            }
            return new Complex(
                (this.re * c.re + this.im * c.im) / denom,
                (this.im * c.re - this.re * c.im) / denom
            );
        }
        if (c === 0) {
            throw new Error("Cannot divide by zero value.");
        }
        return new Complex(this.re / c, this.im / c);
    }

    /**
     * 2つの値の和を計算します。
     * @param {(Complex|number)} c1 - 最初のオペランド
     * @param {(Complex|number)} c2 - 2番目のオペランド
     * @returns {Complex} - 和を表す新しいComplexインスタンス
     */
    static add(c1, c2) {
        const _c1 = c1 instanceof Complex ? c1 : new Complex(c1, 0);
        const _c2 = c2 instanceof Complex ? c2 : new Complex(c2, 0);
        return new Complex(_c1.re + _c2.re, _c1.im + _c2.im);
    }

    /**
     * c1からc2を引いた差を計算します。
     * @param {(Complex|number)} c1 - 最初のオペランド（被減数）
     * @param {(Complex|number)} c2 - 2番目のオペランド（減数）
     * @returns {Complex} - 差を表す新しいComplexインスタンス
     */
    static sub(c1, c2) {
        const _c1 = c1 instanceof Complex ? c1 : new Complex(c1, 0);
        const _c2 = c2 instanceof Complex ? c2 : new Complex(c2, 0);
        return new Complex(_c1.re - _c2.re, _c1.im - _c2.im);
    }

    /**
     * 2つの値の積を計算します。
     * @param {(Complex|number)} c1 - 最初のオペランド
     * @param {(Complex|number)} c2 - 2番目のオペランド
     * @returns {Complex} - 積を表す新しいComplexインスタンス
     */
    static mult(c1, c2) {
        const _c1 = c1 instanceof Complex ? c1 : new Complex(c1, 0);
        const _c2 = c2 instanceof Complex ? c2 : new Complex(c2, 0);

        // 複素数の乗算の公式: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
        return new Complex(
            _c1.re * _c2.re - _c1.im * _c2.im,
            _c1.re * _c2.im + _c1.im * _c2.re
        );
    }

    /**
     * c1をc2で割った商を計算します。
     * @param {(Complex|number)} c1 - 最初のオペランド（被除数）
     * @param {(Complex|number)} c2 - 2番目のオペランド（除数）
     * @returns {Complex} - 商を表す新しいComplexインスタンス
     * @throws {Error} - 除数がゼロの場合。
     */
    static div(c1, c2) {
        const _c1 = c1 instanceof Complex ? c1 : new Complex(c1, 0);
        const _c2 = c2 instanceof Complex ? c2 : new Complex(c2, 0);

        const denom = _c2.re * _c2.re + _c2.im * _c2.im;

        // ゼロ除算のチェック
        if (denom === 0) {
            throw new Error("Cannot divide by zero value.");
        }

        // 複素数の除算の公式: (a + bi) / (c + di) = [(ac + bd) + (bc - ad)i] / (c^2 + d^2)
        return new Complex(
            (_c1.re * _c2.re + _c1.im * _c2.im) / denom,
            (_c1.im * _c2.re - _c1.re * _c2.im) / denom
        );
    }


    /**
     * 現在の複素数の共役複素数を計算します。
     * @returns {Complex} - 共役複素数を表す新しいComplexインスタンス。
     */
    conj() {
        return new Complex(this.re, -this.im);
    }

    /**
     * 現在の複素数の絶対値（大きさ、モジュラス）を計算します。
     * @returns {number} - 複素数の絶対値。
     */
    mag() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    /**
     * 現在の複素数の偏角（引数、フェーズ）をラジアンで計算します。
     * @returns {number} - 複素数の偏角（-πからπの範囲）。
     */
    arg() {
        return Math.atan2(this.im, this.re);
    }

    /**
     * 複素数を文字列形式で表現します (例: "3 + 4i")。
     * @returns {string} - 複素数の文字列表現。
     */
    toString() {
        return `${this.re} + ${this.im}i`;
    }

    /**
     * 極形式 (r, theta) から Complex インスタンスを生成する静的メソッド
     * @param {number} r - 絶対値 (magnitude)
     * @param {number} theta - 偏角 (argument/phase), 単位はラジアン
     * @returns {Complex} - 新しいComplexインスタンス
     */
    static fromPolar(r, theta) {
        // 実部 = r * cos(theta)
        const re = r * Math.cos(theta);
        // 虚部 = r * sin(theta)
        const im = r * Math.sin(theta);

        return new Complex(re, im);
    }
}
