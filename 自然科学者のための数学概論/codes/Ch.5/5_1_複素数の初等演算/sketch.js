// 5.1複素数の初等演算

function setup() {
    createCanvas(400, 400);

    // 複素数の定義と演算のテスト
    let z1 = new Complex(3, 4); // 3 + 4i
    let z2 = new Complex(1, 2); // 1 + 2i

    console.log("z1 =", z1.toString());
    console.log("z2 =", z2.toString());

    let sum = z1.add(z2);
    console.log("z1 + z2 =", sum.toString());

    let sub = z1.sub(z2);
    console.log("z1 - z2 =", sub.toString());

    let prod = z1.mult(z2);
    console.log("z1 * z2 =", prod.toString());

    let div = z1.div(z2);
    console.log("z1 / z2 =", div.toString());

    let mag = z1.mag();
    console.log("|z1| =", mag);

    let sum_static = Complex.add(z1, z2);
    console.log("z1 + z2 =", sum_static.toString());

    let sub_static = Complex.sub(z1, z2);
    console.log("z1 - z2 =", sub_static.toString());

    let prod_static = Complex.mult(z1, z2);
    console.log("z1 * z2 =", prod_static.toString());

    let div_static = Complex.div(z1, z2);
    console.log("z1 / z2 =", div_static.toString());

    //曲形式で与えられた座標から直交座標に変換
    let z3 = Complex.fromPolar(4, Math.PI / 6);
    console.log("z3 (4exp(iπ/6)) =", z3.toString());

}

function draw() {
    background(220);
}