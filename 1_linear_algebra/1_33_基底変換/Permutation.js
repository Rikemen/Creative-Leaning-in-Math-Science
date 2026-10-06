/** {1, ..., n} から自分自身への全単射を表す。Matrix や p5.js には依存しない。 */
class Permutation {
    #images;

    /** @param {number[]} images - [σ(1), ..., σ(n)]。例: [2, 3, 1] */
    constructor(images) {
        if (!Array.isArray(images)) {
            throw new TypeError('置換の対応は配列で指定してください。');
        }
        if (images.length === 0) {
            throw new RangeError('置換には1個以上の要素が必要です。');
        }
        const seen = new Set();
        // for...of は疎配列の穴も undefined として検証する。
        for (const value of images) {
            Permutation.#validateElement(value, images.length);
            if (seen.has(value)) {
                throw new RangeError('置換の対応先は重複できません。');
            }
            seen.add(value);
        }
        this.#images = [...images];
    }

    /** @returns {number} 次数（読み取り専用） */
    get size() {
        return this.#images.length;
    }

    /** @param {number} i - 1〜n の整数。 @returns {number} σ(i) */
    apply(i) {
        Permutation.#validateElement(i, this.size);
        return this.#images[i - 1];
    }

    /** @returns {number[]} 対応表のコピー */
    toArray() {
        return [...this.#images];
    }

    /** @param {number} n - 正の整数。 @returns {Permutation} 恒等置換 */
    static identity(n) {
        if (typeof n !== 'number') {
            throw new TypeError('次数は数値で指定してください。');
        }
        if (!Number.isInteger(n) || n < 1) {
            throw new RangeError('次数は1以上の整数で指定してください。');
        }
        return new Permutation(Array.from({ length: n }, (_, i) => i + 1));
    }

    /**
     * σ∘τ を返す。右側の τ を先に適用し、元の置換は変更しない。
     * @param {Permutation} other - τ
     * @returns {Permutation}
     */
    compose(other) {
        if (!(other instanceof Permutation)) {
            throw new TypeError('合成相手には置換を指定してください。');
        }
        if (this.size !== other.size) {
            throw new RangeError('合成する置換の次数が一致しません。');
        }
        const result = [];
        for (let i = 1; i <= this.size; i++) {
            result.push(this.apply(other.apply(i)));
        }
        return new Permutation(result);
    }

    /** @returns {Permutation} 元の置換を変更せずに逆置換を返す。 */
    inverse() {
        const result = [];
        for (let i = 1; i <= this.size; i++) {
            // σ(i) の行き先を i にする。配列の添字だけ0始まりに変換する。
            result[this.apply(i) - 1] = i;
        }
        return new Permutation(result);
    }

    /**
     * (a₁ a₂ ... aₖ) を作る。指定外の要素は固定する。
     * @param {number} n - 次数
     * @param {number[]} elements - 巡回する順番（1要素なら恒等置換）
     * @returns {Permutation}
     */
    static cycle(n, elements) {
        const result = Permutation.identity(n).toArray();
        if (!Array.isArray(elements)) {
            throw new TypeError('巡回する要素は配列で指定してください。');
        }
        if (elements.length === 0) {
            throw new RangeError('巡回には1個以上の要素が必要です。');
        }
        const seen = new Set();
        for (const value of elements) {
            Permutation.#validateElement(value, n);
            if (seen.has(value)) {
                throw new RangeError('巡回する要素は重複できません。');
            }
            seen.add(value);
        }
        for (let i = 0; i < elements.length; i++) {
            // 最後の要素は先頭へ戻す。
            result[elements[i] - 1] = elements[(i + 1) % elements.length];
        }
        return new Permutation(result);
    }

    /**
     * 異なる2要素 a, b を交換する互換 (a b) を作る。
     * @param {number} n - 次数
     * @param {number} a
     * @param {number} b
     * @returns {Permutation}
     */
    static transposition(n, a, b) {
        return Permutation.cycle(n, [a, b]);
    }

    /** @returns {number} 転倒数 I に対する符号 (-1)^I（+1 または -1） */
    sign() {
        let inversions = 0;
        for (let i = 1; i <= this.size; i++) {
            for (let j = i + 1; j <= this.size; j++) {
                // i < j なのに σ(i) > σ(j) となる組が「転倒」。
                if (this.apply(i) > this.apply(j)) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0 ? 1 : -1;
    }

    /** @returns {boolean} 偶置換か（符号が +1） */
    isEven() {
        return this.sign() === 1;
    }

    /** @returns {boolean} 奇置換か（符号が -1） */
    isOdd() {
        return this.sign() === -1;
    }

    static #validateElement(value, size) {
        if (typeof value !== 'number') {
            throw new TypeError('要素は数値で指定してください。');
        }
        if (!Number.isInteger(value) || value < 1 || value > size) {
            throw new RangeError(`要素は1〜${size}の整数で指定してください。`);
        }
    }
}
