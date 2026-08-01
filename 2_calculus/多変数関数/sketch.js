/**
 * 多変数関数 z = f(x, y) の可視化
 *
 * 表示内容
 * ・曲面 z = f(x, y)
 * ・x方向、y方向の偏微分
 * ・勾配ベクトル
 * ・任意方向の方向微分
 * ・全微分による一次近似
 *
 * 操作
 * ・ドラッグ：視点回転
 * ・ホイール：拡大・縮小
 */

const DOMAIN = 3.5;
const GRID_STEP = 0.2;
const WORLD_SCALE = 58;

let controls = {};
let resultDiv;

function setup() {
    createCanvas(
        windowWidth,
        Math.max(windowHeight, 720),
        WEBGL
    );

    pixelDensity(1);
    setupCamera();
    setupControls();
}

function draw() {
    background(7, 12, 24);

    orbitControl(1, 1, 0.08);

    const x = controls.x.value();
    const y = controls.y.value();
    const angle = radians(controls.angle.value());

    const dx = controls.dx.value();
    const dy = controls.dy.value();

    const direction = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    };

    const z = scalarFunction(x, y);
    const gradient = getGradient(x, y);

    const directionDerivative =
        getDirectionalDerivative(x, y, direction);

    const df = getTotalDifferential(
        x,
        y,
        dx,
        dy
    );

    const actualDelta =
        scalarFunction(x + dx, y + dy) - z;

    drawAxes();
    drawSurface();

    drawTangentPlane(
        x,
        y,
        z,
        gradient
    );

    drawDifferentialObjects({
        x,
        y,
        z,
        dx,
        dy,
        gradient,
        direction,
        directionDerivative,
        df,
    });

    updateResultPanel({
        x,
        y,
        z,
        dx,
        dy,
        gradient,
        direction,
        directionDerivative,
        df,
        actualDelta,
    });
}

/* =========================================
   多変数関数
========================================= */

/**
 * 2変数スカラー値関数
 *
 * R² → R
 * (x, y) → z
 */
function scalarFunction(x, y) {
    return (
        1.2 * Math.sin(x) * Math.cos(y) +
        0.12 * (x * x - y * y)
    );
}

/* =========================================
   偏微分
========================================= */

/**
 * xについての偏微分
 *
 * ∂f/∂x
 * = 1.2 cos(x) cos(y) + 0.24x
 */
function getPartialDerivativeX(x, y) {
    return (
        1.2 * Math.cos(x) * Math.cos(y) +
        0.24 * x
    );
}

/**
 * yについての偏微分
 *
 * ∂f/∂y
 * = -1.2 sin(x) sin(y) - 0.24y
 */
function getPartialDerivativeY(x, y) {
    return (
        -1.2 * Math.sin(x) * Math.sin(y) -
        0.24 * y
    );
}

/* =========================================
   勾配
========================================= */

/**
 * 勾配ベクトルを求める
 *
 * ∇f(x, y)
 * = (∂f/∂x, ∂f/∂y)
 */
function getGradient(x, y) {
    return {
        x: getPartialDerivativeX(x, y),
        y: getPartialDerivativeY(x, y),
    };
}

/* =========================================
   方向微分
========================================= */

/**
 * 任意方向の方向微分を求める
 *
 * D_u f = ∇f・u
 *
 * directionは関数内で単位ベクトルに変換する。
 */
function getDirectionalDerivative(
    x,
    y,
    direction
) {
    const unitDirection =
        normalizeDirection(direction);

    const gradient = getGradient(x, y);

    return (
        gradient.x * unitDirection.x +
        gradient.y * unitDirection.y
    );
}

/**
 * 方向ベクトルを単位ベクトルにする
 */
function normalizeDirection(direction) {
    const length = Math.hypot(
        direction.x,
        direction.y
    );

    if (length < 0.000001) {
        throw new Error(
            "方向ベクトルをゼロベクトルにはできません。"
        );
    }

    return {
        x: direction.x / length,
        y: direction.y / length,
    };
}

/* =========================================
   全微分
========================================= */

/**
 * 全微分を求める
 *
 * df
 * = (∂f/∂x)dx + (∂f/∂y)dy
 *
 * 小さなdx, dyに対して
 * Δf ≈ df
 */
function getTotalDifferential(
    x,
    y,
    dx,
    dy
) {
    const gradient = getGradient(x, y);

    return (
        gradient.x * dx +
        gradient.y * dy
    );
}

/* =========================================
   接平面
========================================= */

/**
 * 点(x0, y0)における接平面の高さ
 *
 * z ≈ f(x0,y0)
 *   + fx(x0,y0)(x-x0)
 *   + fy(x0,y0)(y-y0)
 */
function getTangentPlaneZ(
    x,
    y,
    x0,
    y0
) {
    const z0 = scalarFunction(x0, y0);
    const gradient = getGradient(x0, y0);

    return (
        z0 +
        gradient.x * (x - x0) +
        gradient.y * (y - y0)
    );
}

/* =========================================
   描画
========================================= */

function drawSurface() {
    stroke(180, 205, 235, 50);
    strokeWeight(0.7);

    for (
        let x = -DOMAIN;
        x < DOMAIN;
        x += GRID_STEP
    ) {
        beginShape(TRIANGLE_STRIP);

        for (
            let y = -DOMAIN;
            y <= DOMAIN;
            y += GRID_STEP
        ) {
            addSurfaceVertex(x, y);
            addSurfaceVertex(x + GRID_STEP, y);
        }

        endShape();
    }
}

function addSurfaceVertex(x, y) {
    const z = scalarFunction(x, y);

    const amount = constrain(
        map(z, -2.5, 2.5, 0, 1),
        0,
        1
    );

    const lowColor = color(40, 100, 190, 190);
    const highColor = color(70, 225, 220, 210);

    fill(lerpColor(lowColor, highColor, amount));

    const point = mathToRender(x, y, z);

    vertex(point.x, point.y, point.z);
}

function drawTangentPlane(
    x0,
    y0,
    z0,
    gradient
) {
    const size = 0.8;

    fill(255, 190, 60, 75);
    stroke(255, 205, 90, 180);
    strokeWeight(1.3);

    beginShape();

    addTangentPlaneVertex(
        x0 - size,
        y0 - size,
        x0,
        y0
    );

    addTangentPlaneVertex(
        x0 + size,
        y0 - size,
        x0,
        y0
    );

    addTangentPlaneVertex(
        x0 + size,
        y0 + size,
        x0,
        y0
    );

    addTangentPlaneVertex(
        x0 - size,
        y0 + size,
        x0,
        y0
    );

    endShape(CLOSE);
}

function addTangentPlaneVertex(
    x,
    y,
    x0,
    y0
) {
    const z = getTangentPlaneZ(
        x,
        y,
        x0,
        y0
    );

    const point = mathToRender(x, y, z);

    vertex(point.x, point.y, point.z);
}

function drawDifferentialObjects(data) {
    const {
        x,
        y,
        z,
        dx,
        dy,
        gradient,
        direction,
        directionDerivative,
        df,
    } = data;

    const start = { x, y, z };

    // 現在の点
    drawPoint3D(
        start,
        color(255),
        8
    );

    // x偏微分を表す接ベクトル
    drawVector3D(
        start,
        {
            x: 0.9,
            y: 0,
            z: gradient.x * 0.9,
        },
        color(255, 90, 90)
    );

    // y偏微分を表す接ベクトル
    drawVector3D(
        start,
        {
            x: 0,
            y: 0.9,
            z: gradient.y * 0.9,
        },
        color(80, 155, 255)
    );

    // 任意方向の接ベクトル
    const directionLength = 1.15;

    drawVector3D(
        start,
        {
            x: direction.x * directionLength,
            y: direction.y * directionLength,
            z:
                directionDerivative *
                directionLength,
        },
        color(235, 90, 230)
    );

    // 勾配ベクトル
    const gradientLength = Math.hypot(
        gradient.x,
        gradient.y
    );

    if (gradientLength > 0.0001) {
        drawVector3D(
            start,
            {
                x:
                    (gradient.x / gradientLength) *
                    1.3,
                y:
                    (gradient.y / gradientLength) *
                    1.3,
                z: 0,
            },
            color(80, 255, 130)
        );
    }

    // 全微分による予測点
    const predictedPoint = {
        x: x + dx,
        y: y + dy,
        z: z + df,
    };

    drawVector3D(
        start,
        {
            x: dx,
            y: dy,
            z: df,
        },
        color(255, 220, 70)
    );

    drawPoint3D(
        predictedPoint,
        color(255, 220, 70),
        6
    );

    // 実際の曲面上の移動先
    const actualPoint = {
        x: x + dx,
        y: y + dy,
        z: scalarFunction(x + dx, y + dy),
    };

    drawPoint3D(
        actualPoint,
        color(255, 120, 70),
        7
    );

    // 一次近似と実値の誤差
    drawLine3D(
        predictedPoint,
        actualPoint,
        color(255, 130, 90)
    );
}

function drawVector3D(
    start,
    vector,
    vectorColor
) {
    const end = {
        x: start.x + vector.x,
        y: start.y + vector.y,
        z: start.z + vector.z,
    };

    drawLine3D(start, end, vectorColor);

    drawPoint3D(
        end,
        vectorColor,
        4.5
    );
}

function drawLine3D(
    start,
    end,
    lineColor
) {
    const a = mathToRender(
        start.x,
        start.y,
        start.z
    );

    const b = mathToRender(
        end.x,
        end.y,
        end.z
    );

    stroke(lineColor);
    strokeWeight(3);

    line(
        a.x,
        a.y,
        a.z,
        b.x,
        b.y,
        b.z
    );
}

function drawPoint3D(
    point,
    pointColor,
    radius
) {
    const p = mathToRender(
        point.x,
        point.y,
        point.z
    );

    push();
    translate(p.x, p.y, p.z);

    noStroke();
    fill(pointColor);
    sphere(radius, 14, 10);

    pop();
}

function drawAxes() {
    const axisLength = DOMAIN + 0.5;

    strokeWeight(2);

    // x軸
    stroke(255, 90, 90);
    drawRenderLine(
        -axisLength,
        0,
        0,
        axisLength,
        0,
        0
    );

    // y軸
    stroke(80, 180, 255);
    drawRenderLine(
        0,
        -axisLength,
        0,
        0,
        axisLength,
        0
    );

    // z軸
    stroke(100, 255, 150);
    drawRenderLine(
        0,
        0,
        -3,
        0,
        0,
        3
    );
}

function drawRenderLine(
    x1,
    y1,
    z1,
    x2,
    y2,
    z2
) {
    const a = mathToRender(x1, y1, z1);
    const b = mathToRender(x2, y2, z2);

    line(
        a.x,
        a.y,
        a.z,
        b.x,
        b.y,
        b.z
    );
}

/**
 * 数学座標をp5.jsの3D座標に変換する
 *
 * 数学ではz軸を上向きにしたいため、
 * p5.js側ではzの符号を反転する。
 */
function mathToRender(x, y, z) {
    return createVector(
        x * WORLD_SCALE,
        y * WORLD_SCALE,
        -z * WORLD_SCALE
    );
}

/* =========================================
   UI
========================================= */

function setupControls() {
    const panel = createDiv();

    panel.position(16, 16);
    panel.style("width", "320px");
    panel.style("padding", "14px");
    panel.style(
        "background",
        "rgba(10, 18, 35, 0.92)"
    );
    panel.style("color", "#eef5ff");
    panel.style("border-radius", "12px");
    panel.style(
        "font-family",
        "sans-serif"
    );
    panel.style("font-size", "13px");
    panel.style("z-index", "10");

    const title = createDiv(
        "<strong>多変数関数 z = f(x, y)</strong>"
    );

    title.parent(panel);
    title.style("font-size", "16px");
    title.style("margin-bottom", "6px");

    const formula = createDiv(
        "f(x,y) = 1.2 sin(x) cos(y) + 0.12(x² − y²)"
    );

    formula.parent(panel);
    formula.style("color", "#aebed8");
    formula.style("margin-bottom", "12px");

    controls.x = addSlider(
        panel,
        "x",
        -2.6,
        2.6,
        0.8,
        0.01
    );

    controls.y = addSlider(
        panel,
        "y",
        -2.6,
        2.6,
        0.6,
        0.01
    );

    controls.angle = addSlider(
        panel,
        "方向 θ",
        0,
        360,
        35,
        1
    );

    controls.dx = addSlider(
        panel,
        "dx",
        -0.8,
        0.8,
        0.45,
        0.01
    );

    controls.dy = addSlider(
        panel,
        "dy",
        -0.8,
        0.8,
        0.25,
        0.01
    );

    resultDiv = createDiv();
    resultDiv.parent(panel);
    resultDiv.style("margin-top", "12px");
    resultDiv.style("line-height", "1.65");
}

function addSlider(
    parent,
    label,
    min,
    max,
    value,
    step
) {
    const wrapper = createDiv();
    wrapper.parent(parent);
    wrapper.style("margin-bottom", "8px");

    const labelElement = createDiv(label);
    labelElement.parent(wrapper);
    labelElement.style("margin-bottom", "2px");

    const slider = createSlider(
        min,
        max,
        value,
        step
    );

    slider.parent(wrapper);
    slider.style("width", "100%");

    return slider;
}

function updateResultPanel(data) {
    const {
        x,
        y,
        z,
        dx,
        dy,
        gradient,
        direction,
        directionDerivative,
        df,
        actualDelta,
    } = data;

    const error = actualDelta - df;

    resultDiv.html(`
    <div style="border-top:1px solid #43506a;
                padding-top:10px;">
      f(x,y) = ${format(z)}<br>

      <span style="color:#ff7777">
        ∂f/∂x = ${format(gradient.x)}
      </span><br>

      <span style="color:#6aa8ff">
        ∂f/∂y = ${format(gradient.y)}
      </span><br>

      <span style="color:#70ff9a">
        ∇f = (${format(gradient.x)},
        ${format(gradient.y)})
      </span><br>

      u = (${format(direction.x)},
      ${format(direction.y)})<br>

      <span style="color:#ef75e8">
        D<sub>u</sub>f =
        ${format(directionDerivative)}
      </span><br>

      <span style="color:#ffe060">
        df = ${format(df)}
      </span><br>

      実際の Δf = ${format(actualDelta)}<br>
      一次近似の誤差 = ${format(error)}
    </div>

    <div style="margin-top:8px;
                color:#aebed8;">
      赤：x偏微分　
      青：y偏微分<br>
      緑：勾配　
      紫：方向微分<br>
      黄：全微分による予測　
      橙：実際の値
    </div>
  `);
}

function format(value) {
    return Number(value).toFixed(3);
}

function setupCamera() {
    camera(
        520,
        -520,
        420,
        0,
        0,
        0,
        0,
        0,
        -1
    );

    perspective(
        PI / 3,
        width / height,
        1,
        5000
    );
}

function windowResized() {
    resizeCanvas(
        windowWidth,
        Math.max(windowHeight, 720)
    );

    setupCamera();
}