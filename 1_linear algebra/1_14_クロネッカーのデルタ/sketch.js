
let a1 = new Matrix(3, 3);


function setup() {
    createCanvas(windowWidth, windowHeight);

    //a1は全ての成分が0の3✖︎3行列として定義されているので、各成分についてクロネッカーのデルタの関数に(i, j)のi,jを入力した結果を代入する（結果は単位行列になるはず）
    for (let i = 0; i < a1.rows; i++) {
        for (let j = 0; j < a1.cols; j++) {
            a1.data[i][j] = kroneckerDelta(i, j);
        }
    }

    console.log("a1 is ", a1.data);

}

function draw() {
    background(176, 224, 230);

}
