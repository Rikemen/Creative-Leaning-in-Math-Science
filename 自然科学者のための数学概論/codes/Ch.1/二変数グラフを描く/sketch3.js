let font;
let scale = 100;//グラフのズームアップ度合い(50なら50倍ズーム)
let cellSize = 100; //方眼の１マスが何pixelか
let axisSize = 500;//軸の長さ

function preload() {
    font = loadFont('./assets/Brooklyn Chill Out.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
    background(176, 224, 230);
    orbitControl();


    // 軸を描画
    push();
    resetMatrix();
    drawAxis(500);
    drawGrid(cellSize, scale, axisSize);
    pop();

    fill('deeppink');
    textFont(font);
    textSize(36);
    text('p5*js', 10, 50);

    // グラフを描画
    stroke(220);
    strokeWeight(1);
    fill(255);
    beginShape(TRIANGLE_STRIP);
    let gridSpacing = 10;
    for (let x = -axisSize / 2; x < axisSize / 2; x += gridSpacing) {
        for (let y = -axisSize / 2; y < axisSize / 2; y += gridSpacing) {
            let z1 = targetFunction(x, y);
            let z2 = targetFunction(x + gridSpacing, y);
            vertex(x, y, z1);
            vertex(x + gridSpacing, y, z2);
        }

    }
    endShape(CLOSE);
}


function drawAxis(axisSize) {
    console.log("drawAxis");
    // x軸とy軸を描画
    stroke(255);
    strokeWeight(2);
    line(-axisSize / 2, 0, 0, axisSize / 2, 0, 0); // x軸
    line(0, -axisSize / 2, 0, 0, axisSize / 2, 0); // y軸
    line(0, 0, -axisSize / 2, 0, 0, axisSize / 2); // z軸

    // X軸に「x」を表示
    push();
    translate(axisSize / 2, 0, 0); // ラベルの位置に移動
    text("x", 0, 0);
    pop();

    // Y軸に「y」を表示
    push();
    translate(0, axisSize / 2, 0); // ラベルの位置に移動
    text("y", 0, 0);
    pop();

    // Z軸に「z」を表示
    push();
    translate(0, 0, axisSize / 2); // ラベルの位置に移動
    text("z", 0, 0);
    pop();

}

function drawGrid(cellSize, scale, axisSize) {
    console.log("drawGrid");

    // 縦線を描画
    for (let x = -axisSize / 2; x < axisSize / 2; x += cellSize) {
        stroke(230); // グリッドの色
        strokeWeight(1); // グリッドの線の太さ
        line(x, -axisSize / 2, 0, x, axisSize / 2, 0);

        if (x != 0) {//原点はメモリ不要なので除外
            textSize(10);
            fill(0);
            noStroke();
            text(`${x / cellSize * (cellSize / scale)}`, x, - 10, 0);
        }


    }

    // 横線を描画
    for (let y = - axisSize / 2; y < axisSize / 2; y += cellSize) {
        stroke(230); // グリッドの色
        strokeWeight(1); // グリッドの線の太さ
        line(-axisSize / 2, y, 0, axisSize / 2, y, 0);

        if (y != 0) {//原点はメモリ不要なので除外
            textSize(10);
            fill(0);
            noStroke();
            text(`${y / cellSize * (cellSize / scale)}`, 10, y, 0);
        }

    }

}


//グラフとして描画したい関数、x, y座標を入れるとz = f(x, y)座標を戻す
function targetFunction(x, y) {
    // console.log("targetFunction");
    let z;
    let scaledX = x / scale; // スケーリング
    let scaledY = y / scale;
    z = 0.5 * scaledX + 0.5 * scaledY; // z = x + 2y
    let scaledZ = z * scale;
    return scaledZ;
}