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
}
