/**
 * 1変数ベクトル値関数の可視化
 *
 * 1. アルキメデス螺旋
 * 2. 放物線
 * 3. リサージュ曲線
 *
 * 操作:
 * SPACE : 一時停止・再開
 * R     : アニメーションをリセット
 */

const ANIMATION_DURATION = 12;

let animationTime = 0;
let isPaused = false;

const curves = [
    {
        name: "アルキメデス螺旋",
        formula: "r(t) = (0.35t cos t, 0.35t sin t)",
        tMin: 0,
        tMax: Math.PI * 8,

        position(t) {
            const radius = 0.35 * t;

            return {
                x: radius * Math.cos(t),
                y: radius * Math.sin(t),
            };
        },
    },

    {
        name: "放物線",
        formula: "r(t) = (t, t² / 4)",
        tMin: -4,
        tMax: 4,

        position(t) {
            return {
                x: t,
                y: (t * t) / 4,
            };
        },
    },

    {
        name: "リサージュ曲線",
        formula: "r(t) = (sin(3t + π/2), sin(4t))",
        tMin: 0,
        tMax: Math.PI * 2,

        position(t) {
            return {
                x: Math.sin(3 * t + Math.PI / 2),
                y: Math.sin(4 * t),
            };
        },
    },
];

function setup() {
    createCanvas(windowWidth, getCanvasHeight(windowWidth));

    pixelDensity(1);
    textFont("sans-serif");
    strokeCap(ROUND);
    strokeJoin(ROUND);

    // 各曲線の表示範囲を事前計算
    for (const curve of curves) {
        curve.bounds = calculateBounds(curve);
    }
}

function draw() {
    background(7, 12, 25);

    if (!isPaused) {
        animationTime += deltaTime / 1000;
    }

    const progress =
        (animationTime % ANIMATION_DURATION) / ANIMATION_DURATION;

    drawHeader(progress);
    drawCurvePanels(progress);
    drawLegend();
}

function drawHeader(progress) {
    noStroke();
    fill(240);
    textAlign(LEFT, CENTER);
    textSize(22);
    textStyle(BOLD);

    text("1変数ベクトル値関数", 20, 26);

    textStyle(NORMAL);
    textSize(13);
    fill(150, 165, 190);

    const status = isPaused ? "停止中" : "再生中";

    text(
        `${status}　SPACE: 停止・再開　R: リセット`,
        20,
        52
    );

    // 全体の時間進行バー
    const barX = 20;
    const barY = 68;
    const barWidth = width - 40;

    noStroke();
    fill(35, 47, 70);
    rect(barX, barY, barWidth, 4, 2);

    fill(56, 210, 255);
    rect(barX, barY, barWidth * progress, 4, 2);
}

function drawCurvePanels(progress) {
    const margin = 16;
    const gap = 16;
    const top = 88;

    const columns = width < 900 ? 1 : 3;
    const rows = Math.ceil(curves.length / columns);

    const panelWidth =
        (width - margin * 2 - gap * (columns - 1)) / columns;

    const availableHeight = height - top - 58;
    const panelHeight =
        (availableHeight - gap * (rows - 1)) / rows;

    for (let i = 0; i < curves.length; i++) {
        const column = i % columns;
        const row = Math.floor(i / columns);

        const panel = {
            x: margin + column * (panelWidth + gap),
            y: top + row * (panelHeight + gap),
            width: panelWidth,
            height: panelHeight,
        };

        drawCurvePanel(curves[i], panel, progress);
    }
}

function drawCurvePanel(curve, panel, progress) {
    // パネル背景
    fill(14, 22, 40);
    stroke(45, 60, 88);
    strokeWeight(1);
    rect(
        panel.x,
        panel.y,
        panel.width,
        panel.height,
        12
    );

    // 曲線名
    noStroke();
    fill(240);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(17);

    text(curve.name, panel.x + 16, panel.y + 14);

    // 数式
    textStyle(NORMAL);
    textSize(12);
    fill(150, 170, 200);

    text(curve.formula, panel.x + 16, panel.y + 42);

    const currentT = lerp(curve.tMin, curve.tMax, progress);

    textAlign(RIGHT, TOP);
    text(
        `t = ${currentT.toFixed(2)}`,
        panel.x + panel.width - 16,
        panel.y + 16
    );

    const plot = {
        x: panel.x + 18,
        y: panel.y + 70,
        width: panel.width - 36,
        height: panel.height - 88,
    };

    const viewport = createViewport(plot, curve.bounds);

    drawCoordinateGrid(plot, viewport);

    // 曲線全体
    drawCurveSection(
        curve,
        curve.tMin,
        curve.tMax,
        viewport,
        color(60, 76, 105),
        1.5,
        500
    );

    // 現在までの軌跡
    drawCurveSection(
        curve,
        curve.tMin,
        currentT,
        viewport,
        color(55, 215, 255),
        3,
        Math.max(2, Math.floor(500 * progress))
    );

    drawCurrentState(curve, currentT, viewport);
}

function drawCurrentState(curve, t, viewport) {
    const currentPosition = curve.position(t);

    const point = worldToScreen(
        currentPosition,
        viewport
    );

    const origin = worldToScreen(
        { x: 0, y: 0 },
        viewport
    );

    // 原点から現在位置への位置ベクトル
    drawArrow(
        origin.x,
        origin.y,
        point.x,
        point.y,
        color(255, 195, 70),
        2
    );

    // 数値微分で接線方向を計算
    const epsilon =
        (curve.tMax - curve.tMin) / 2000;

    const before = curve.position(
        constrain(t - epsilon, curve.tMin, curve.tMax)
    );

    const after = curve.position(
        constrain(t + epsilon, curve.tMin, curve.tMax)
    );

    const beforeScreen = worldToScreen(before, viewport);
    const afterScreen = worldToScreen(after, viewport);

    let tangentX = afterScreen.x - beforeScreen.x;
    let tangentY = afterScreen.y - beforeScreen.y;

    const tangentLength = Math.hypot(tangentX, tangentY);

    if (tangentLength > 0.0001) {
        const displayLength = 48;

        tangentX =
            (tangentX / tangentLength) * displayLength;

        tangentY =
            (tangentY / tangentLength) * displayLength;

        drawArrow(
            point.x,
            point.y,
            point.x + tangentX,
            point.y + tangentY,
            color(255, 90, 180),
            2
        );
    }

    // 現在位置
    noStroke();
    fill(255);
    circle(point.x, point.y, 10);

    fill(55, 215, 255, 70);
    circle(point.x, point.y, 22);
}

function drawCurveSection(
    curve,
    startT,
    endT,
    viewport,
    curveColor,
    weight,
    samples
) {
    if (samples < 2 || endT <= startT) {
        return;
    }

    noFill();
    stroke(curveColor);
    strokeWeight(weight);

    beginShape();

    for (let i = 0; i <= samples; i++) {
        const ratio = i / samples;
        const t = lerp(startT, endT, ratio);
        const position = curve.position(t);
        const screen = worldToScreen(position, viewport);

        vertex(screen.x, screen.y);
    }

    endShape();
}

function drawCoordinateGrid(plot, viewport) {
    push();

    // 描画領域からはみ出さないようにする
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(
        plot.x,
        plot.y,
        plot.width,
        plot.height
    );
    drawingContext.clip();

    const bounds = viewport.bounds;

    const xStep = calculateGridStep(
        bounds.xMax - bounds.xMin
    );

    const yStep = calculateGridStep(
        bounds.yMax - bounds.yMin
    );

    strokeWeight(1);
    stroke(35, 48, 72);

    // 縦グリッド
    const firstX = Math.ceil(bounds.xMin / xStep) * xStep;

    for (let x = firstX; x <= bounds.xMax; x += xStep) {
        const screen = worldToScreen(
            { x, y: 0 },
            viewport
        );

        line(
            screen.x,
            plot.y,
            screen.x,
            plot.y + plot.height
        );
    }

    // 横グリッド
    const firstY = Math.ceil(bounds.yMin / yStep) * yStep;

    for (let y = firstY; y <= bounds.yMax; y += yStep) {
        const screen = worldToScreen(
            { x: 0, y },
            viewport
        );

        line(
            plot.x,
            screen.y,
            plot.x + plot.width,
            screen.y
        );
    }

    // x軸
    if (bounds.yMin <= 0 && bounds.yMax >= 0) {
        const origin = worldToScreen(
            { x: 0, y: 0 },
            viewport
        );

        stroke(100, 120, 155);
        strokeWeight(1.5);

        line(
            plot.x,
            origin.y,
            plot.x + plot.width,
            origin.y
        );
    }

    // y軸
    if (bounds.xMin <= 0 && bounds.xMax >= 0) {
        const origin = worldToScreen(
            { x: 0, y: 0 },
            viewport
        );

        stroke(100, 120, 155);
        strokeWeight(1.5);

        line(
            origin.x,
            plot.y,
            origin.x,
            plot.y + plot.height
        );
    }

    drawingContext.restore();
    pop();
}

function drawArrow(
    startX,
    startY,
    endX,
    endY,
    arrowColor,
    weight
) {
    const angle = Math.atan2(
        endY - startY,
        endX - startX
    );

    const arrowSize = 8;

    stroke(arrowColor);
    strokeWeight(weight);
    line(startX, startY, endX, endY);

    push();
    translate(endX, endY);
    rotate(angle);

    noStroke();
    fill(arrowColor);

    triangle(
        0,
        0,
        -arrowSize,
        -arrowSize * 0.45,
        -arrowSize,
        arrowSize * 0.45
    );

    pop();
}

function drawLegend() {
    const y = height - 30;

    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(NORMAL);

    drawLegendItem(
        width / 2 - 140,
        y,
        color(55, 215, 255),
        "軌跡"
    );

    drawLegendItem(
        width / 2,
        y,
        color(255, 195, 70),
        "位置ベクトル r(t)"
    );

    drawLegendItem(
        width / 2 + 160,
        y,
        color(255, 90, 180),
        "接線ベクトル r′(t)"
    );
}

function drawLegendItem(x, y, itemColor, label) {
    noStroke();
    fill(itemColor);
    circle(x - 38, y, 8);

    fill(180, 195, 215);
    text(label, x + 10, y);
}

function calculateBounds(curve) {
    const samples = 1000;

    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    // 原点も表示範囲に含める
    xMin = Math.min(xMin, 0);
    xMax = Math.max(xMax, 0);
    yMin = Math.min(yMin, 0);
    yMax = Math.max(yMax, 0);

    for (let i = 0; i <= samples; i++) {
        const t = lerp(
            curve.tMin,
            curve.tMax,
            i / samples
        );

        const position = curve.position(t);

        xMin = Math.min(xMin, position.x);
        xMax = Math.max(xMax, position.x);
        yMin = Math.min(yMin, position.y);
        yMax = Math.max(yMax, position.y);
    }

    const xMargin = Math.max((xMax - xMin) * 0.12, 0.2);
    const yMargin = Math.max((yMax - yMin) * 0.12, 0.2);

    return {
        xMin: xMin - xMargin,
        xMax: xMax + xMargin,
        yMin: yMin - yMargin,
        yMax: yMax + yMargin,
    };
}

function createViewport(plot, bounds) {
    const rangeX = bounds.xMax - bounds.xMin;
    const rangeY = bounds.yMax - bounds.yMin;

    const scale = Math.min(
        plot.width / rangeX,
        plot.height / rangeY
    );

    return {
        centerX: plot.x + plot.width / 2,
        centerY: plot.y + plot.height / 2,
        worldCenterX: (bounds.xMin + bounds.xMax) / 2,
        worldCenterY: (bounds.yMin + bounds.yMax) / 2,
        scale,
        bounds,
    };
}

function worldToScreen(position, viewport) {
    return {
        x:
            viewport.centerX +
            (position.x - viewport.worldCenterX) *
            viewport.scale,

        y:
            viewport.centerY -
            (position.y - viewport.worldCenterY) *
            viewport.scale,
    };
}

function calculateGridStep(range) {
    const roughStep = range / 6;
    const magnitude =
        Math.pow(10, Math.floor(Math.log10(roughStep)));

    const normalized = roughStep / magnitude;

    let step;

    if (normalized < 1.5) {
        step = 1;
    } else if (normalized < 3) {
        step = 2;
    } else if (normalized < 7) {
        step = 5;
    } else {
        step = 10;
    }

    return step * magnitude;
}

function getCanvasHeight(canvasWidth) {
    return canvasWidth < 900 ? 1130 : 620;
}

function windowResized() {
    resizeCanvas(
        windowWidth,
        getCanvasHeight(windowWidth)
    );
}

function keyPressed() {
    if (key === " ") {
        isPaused = !isPaused;
        return false;
    }

    if (key === "r" || key === "R") {
        animationTime = 0;
    }
}