function setup() {
    console.log("=== ベクトル空間の同型性と一次独立性の判定 ===");
    console.log("数ベクトル、多項式、行列といった異なる空間の要素を、");
    console.log("全く同じ共通アルゴリズム (VectorSpaceElement.isLinearlyIndependent) で判定します。");

    // ==========================================
    // 1. 数ベクトル (1x2行列として表現) の判定
    // ==========================================
    console.log("\n--- ① 数ベクトルの一次独立性 ---");
    
    // 独立な例: (1, 2) と (3, 4)
    let v1 = new Matrix(1, 2); v1.set([[1, 2]]);
    let v2 = new Matrix(1, 2); v2.set([[3, 4]]);
    console.log("v1 = (1, 2), v2 = (3, 4)");
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([v1, v2]) ? "一次独立 (True)" : "一次従属 (False)");

    // 従属な例: (1, 2) と (2, 4)
    let v3 = new Matrix(1, 2); v3.set([[1, 2]]);
    let v4 = new Matrix(1, 2); v4.set([[2, 4]]);
    console.log("\nv3 = (1, 2), v4 = (2, 4)  ※v4 = 2*v3");
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([v3, v4]) ? "一次独立 (True)" : "一次従属 (False)");


    // ==========================================
    // 2. 多項式 (Polynomial) の判定
    // ==========================================
    console.log("\n--- ② 多項式の一次独立性 ---");

    // 独立な例: 1 + x と x
    let p1 = new Polynomial([1, 1]); // 1 + x
    let p2 = new Polynomial([0, 1]); // x
    console.log("P1(x) =", p1.toString());
    console.log("P2(x) =", p2.toString());
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([p1, p2]) ? "一次独立 (True)" : "一次従属 (False)");

    // 従属な例: 1 + x, 2x, 1 + 3x
    let p3 = new Polynomial([1, 1]); // 1 + x
    let p4 = new Polynomial([0, 2]); // 2x
    let p5 = new Polynomial([1, 3]); // 1 + 3x (これは p3 + p4)
    console.log("\nP3(x) =", p3.toString());
    console.log("P4(x) =", p4.toString());
    console.log("P5(x) =", p5.toString(), " ※P5 = P3 + P4");
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([p3, p4, p5]) ? "一次独立 (True)" : "一次従属 (False)");


    // ==========================================
    // 3. 行列 (Matrix) 同士の判定
    // ==========================================
    console.log("\n--- ③ 2x2行列の一次独立性 ---");

    // 独立な例
    let m1 = new Matrix(2, 2); m1.set([[1, 0], [0, 0]]);
    let m2 = new Matrix(2, 2); m2.set([[0, 1], [0, 0]]);
    console.log("M1 =", m1.data);
    console.log("M2 =", m2.data);
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([m1, m2]) ? "一次独立 (True)" : "一次従属 (False)");

    // 従属な例
    let m3 = new Matrix(2, 2); m3.set([[1, 1], [1, 1]]);
    let m4 = new Matrix(2, 2); m4.set([[2, 2], [2, 2]]);
    console.log("\nM3 =", m3.data);
    console.log("M4 =", m4.data, " ※M4 = 2*M3");
    console.log("判定結果:", VectorSpaceElement.isLinearlyIndependent([m3, m4]) ? "一次独立 (True)" : "一次従属 (False)");

    console.log("\n👉 数ベクトル・多項式・行列という異なる概念であっても、同じメソッドで独立性を判定できました！");
}

function draw() {
    // 今回はコンソール出力のみのため描画処理なし
}
