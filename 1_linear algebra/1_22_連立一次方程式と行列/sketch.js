function setup() {
    createCanvas(windowWidth, windowHeight);

    // 通常の行列を定義
    let matrixA = new Matrix(4, 4);
    let matrixB = new Matrix(4, 4);

    // 行列Aのデータ
    // 4*4の行列をわかりやすく書いて
    let dataA = [
        [1, 2, 3, 4], // 1行目
        [5, 6, 7, 8], // 2行目
        [1, 2, 3, 4], // 3行目
        [5, 6, 7, 8]  // 4行目
    ];
    // 行列Bのデータ
    let dataB = [
        [1, 0, 1, 0], // 1行目
        [0, 1, 0, 1], // 2行目
        [1, 0, 1, 0], // 3行目
        [0, 1, 0, 1]  // 4行目
    ];


    matrixA.set(dataA);
    matrixB.set(dataB);

    console.log("行列A: ", matrixA.data);
    console.log("行列B: ", matrixB.data);

    let blockMatrixA = BlockMatrix.fromMatrix(matrixA, 2, 2);
    let blockMatrixB = BlockMatrix.fromMatrix(matrixB, 2, 2);
    console.log("ブロック行列A: ", blockMatrixA.blocks);
    console.log("ブロック行列B: ", blockMatrixB.blocks);

    // // ブロック行列を通常の行列に変換して確認
    let convertedMatrixA = blockMatrixA.toMatrix();
    let convertedMatrixB = blockMatrixB.toMatrix();

    //元の行列matrixA, Bと一致するはず
    console.log("変換された行列A: ", convertedMatrixA.data);
    console.log("変換された行列B: ", convertedMatrixB.data);


    // ブロック行列の和を計算して確認
    let sumMatrix = BlockMatrix.addStatic(blockMatrixA, blockMatrixB);
    console.log("和のブロック行列: ", sumMatrix.blocks);


    // ブロック行列のスカラーメソッドをテスト
    let scalar = 2;
    let scaledMatrixA = BlockMatrix.scaleStatic(blockMatrixA, scalar);
    let scaledMatrixB = BlockMatrix.scaleStatic(blockMatrixB, scalar);
    let scaledMatrixAConverted = scaledMatrixA.toMatrix();
    console.log("スカラー倍された行列A: ", scaledMatrixAConverted.data);
    let scaledMatrixBConverted = scaledMatrixB.toMatrix();
    console.log("スカラー倍された行列B: ", scaledMatrixBConverted.data);




    // // ブロック行列の転置メソッドをテスト
    // // ブロック行列Aの転置
    let transposedMatrixA = BlockMatrix.transposeStatic(blockMatrixA);
    let transposedMatrixB = BlockMatrix.transposeStatic(blockMatrixB);

    // 予想される結果 dataA = [
    //     [1, 5, 1, 5], // 1行目
    //     [2, 6, 2, 6], // 2行目
    //     [3, 7, 3, 7], // 3行目
    //     [4, 8, 4, 8]  // 4行目
    // ];

    let transposedMatrixAConverted = transposedMatrixA.toMatrix();
    console.log("転置されたブロック行列A: ", transposedMatrixAConverted.data);
    // 予想される結果 dataB = [
    //     [1, 0, 1, 0], // 1行目
    //     [0, 1, 0, 1], // 2行目
    //     [1, 0, 1, 0], // 3行目
    //     [0, 1, 0, 1]  // 4行目
    // ];
    let transposedMatrixBConverted = transposedMatrixB.toMatrix();
    console.log("転置されたブロック行列B: ", transposedMatrixBConverted.data);


    // ブロック行列の積を計算して確認
    let productMatrix = BlockMatrix.multiplyStatic(blockMatrixA, blockMatrixB);
    // 積のブロック行列をコンソールに出力
    console.log("積のブロック行列: ", productMatrix.blocks);
    
    // ブロック行列の積を行列形式に変換してコンソールに出力
    let productMatrixConverted = productMatrix.toMatrix();
    console.log("積の行列: ", productMatrixConverted.data);

    // ブロック行列のインスタンスメソッドのaddをテスト
    let sumMatrixInstance = blockMatrixA.add(blockMatrixB);
    console.log("インスタンスメソッドで計算された和のブロック行列: ", sumMatrixInstance.blocks);

    // ブロック行列のインスタンスメソッドのmultiplyをテスト
    let productMatrixInstance = blockMatrixA.multiply(blockMatrixB);
    console.log("インスタンスメソッドで計算された積のブロック行列: ", productMatrixInstance.blocks);
}

function draw() {
    background(176, 224, 230);
}
