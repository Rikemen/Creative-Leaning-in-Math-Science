function setup() {
    console.log("=== ベクトル空間の次元判定と基底判定 ===");
    console.log("理論編で学んだ「ランク(階数)による次元の算出」と");
    console.log("「同値条件による基底判定」を実装で確認します。\n");

    // ==========================================
    // 1. 数ベクトル (R^3空間) の次元と基底
    // ==========================================
    console.log("--- ① 数ベクトル (R^3空間) ---");
    
    // (1, 0, 0), (0, 1, 0), (0, 0, 1) - 標準基底
    let v1 = new Matrix(1, 3); v1.set([[1, 0, 0]]);
    let v2 = new Matrix(1, 3); v2.set([[0, 1, 0]]);
    let v3 = new Matrix(1, 3); v3.set([[0, 0, 1]]);
    let set1 = [v1, v2, v3];
    
    console.log("ベクトルの集合1: e1, e2, e3 (標準基底)");
    console.log("-> 空間の次元: ", VectorSpaceElement.getDimension(set1));
    console.log("-> R^3 の基底か?: ", VectorSpaceElement.isBasis(set1, 3) ? "Yes" : "No");

    // (1, 2, 3), (2, 4, 6) - 従属（次元は1になるはず）
    let v4 = new Matrix(1, 3); v4.set([[1, 2, 3]]);
    let v5 = new Matrix(1, 3); v5.set([[2, 4, 6]]);
    let set2 = [v4, v5];
    
    console.log("\nベクトルの集合2: v4=(1,2,3), v5=(2,4,6) ※v5 = 2*v4");
    console.log("-> 空間の次元: ", VectorSpaceElement.getDimension(set2));
    console.log("-> R^3 の基底か?: ", VectorSpaceElement.isBasis(set2, 3) ? "Yes" : "No");


    // ==========================================
    // 2. 多項式 (P_2 空間: 2次以下の多項式, 次元は 3)
    // ==========================================
    console.log("\n--- ② 多項式 (2次以下の多項式空間 P_2) ---");

    // 基底になる例: 1, x, x^2
    let p1 = new Polynomial([1]);       // 1
    let p2 = new Polynomial([0, 1]);    // x
    let p3 = new Polynomial([0, 0, 1]); // x^2
    let set3 = [p1, p2, p3];

    console.log("ベクトルの集合3: 1, x, x^2");
    console.log("-> 空間の次元: ", VectorSpaceElement.getDimension(set3));
    console.log("-> P_2(次元3)の基底か?: ", VectorSpaceElement.isBasis(set3, 3) ? "Yes" : "No");

    // 基底にならない例: 1+x, 1-x (個数が足りないため次元は2)
    let p4 = new Polynomial([1, 1]);  // 1+x
    let p5 = new Polynomial([1, -1]); // 1-x
    let set4 = [p4, p5];

    console.log("\nベクトルの集合4: 1+x, 1-x");
    console.log("-> 空間の次元: ", VectorSpaceElement.getDimension(set4));
    console.log("-> P_2(次元3)の基底か?: ", VectorSpaceElement.isBasis(set4, 3) ? "Yes" : "No");


    // ==========================================
    // 3. 行列 (2x2 行列空間 M(2,2), 次元は 4)
    // ==========================================
    console.log("\n--- ③ 2x2 行列空間 (次元4) ---");

    let m1 = new Matrix(2, 2); m1.set([[1, 0], [0, 0]]);
    let m2 = new Matrix(2, 2); m2.set([[0, 1], [0, 0]]);
    let m3 = new Matrix(2, 2); m3.set([[0, 0], [1, 0]]);
    let m4 = new Matrix(2, 2); m4.set([[0, 0], [0, 1]]);
    let set5 = [m1, m2, m3, m4];

    console.log("ベクトルの集合5: E11, E12, E21, E22 (行列単位)");
    console.log("-> 空間の次元: ", VectorSpaceElement.getDimension(set5));
    console.log("-> M(2,2)(次元4)の基底か?: ", VectorSpaceElement.isBasis(set5, 4) ? "Yes" : "No");

    console.log("\n👉 同値条件「要素数 == 空間の次元 かつ Rank == 空間の次元」をコードで正確に判定できました！");
}

function draw() {
    // コンソール出力のみのため描画なし
}
