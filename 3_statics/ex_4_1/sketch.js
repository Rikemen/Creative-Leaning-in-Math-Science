let data;
let fatherHeights = [];
let motherHeights = [];
let sonHeights = [];
let daughterHeights = [];

function preload() {
    data = loadTable('data/ex_4_1.csv', 'csv', 'header');
}

function setup() {
    createCanvas(400, 400);

    // CSVの各行からデータを取得して配列に格納
    for (let i = 0; i < data.getRowCount(); i++) {
        fatherHeights.push(data.getNum(i, 'father_height'));
        motherHeights.push(data.getNum(i, 'mother_height'));
        sonHeights.push(data.getNum(i, 'son_height'));
        daughterHeights.push(data.getNum(i, 'daughter_height'));
    }

    // 配列の内容を確認
    console.log("Father Heights:", fatherHeights);
    console.log("Mother Heights:", motherHeights);
    console.log("Son Heights:", sonHeights);
    console.log("Daughter Heights:", daughterHeights);

    // 基本的な統計情報を計算
    console.log("Father Height - Mean:", ss.mean(fatherHeights));
    console.log("Mother Height - Mean:", ss.mean(motherHeights));
    console.log("Son Height - Mean:", ss.mean(sonHeights));
    console.log("Daughter Height - Mean:", ss.mean(daughterHeights));

    // 標本分散（不偏分散）を計算
    // simple-statistics の ss.variance() はデフォルトで標本分散（不偏分散）を計算します
    // 標本分散は、データのばらつきを表す統計量で、平均値からの偏差の二乗の和を (n-1) で割った値です
    console.log("Father Height - Sample Variance:", ss.variance(fatherHeights));
    console.log("Mother Height - Sample Variance:", ss.variance(motherHeights));
    console.log("Son Height - Sample Variance:", ss.variance(sonHeights));
    console.log("Daughter Height - Sample Variance:", ss.variance(daughterHeights));

    // 標本標準偏差を計算
    // simple-statistics の ss.standardDeviation() は標本標準偏差を計算します
    // 標本標準偏差は、標本分散の平方根です
    console.log("Father Height - Sample Standard Deviation:", ss.standardDeviation(fatherHeights));
    console.log("Mother Height - Sample Standard Deviation:", ss.standardDeviation(motherHeights));
    console.log("Son Height - Sample Standard Deviation:", ss.standardDeviation(sonHeights));
    console.log("Daughter Height - Sample Standard Deviation:", ss.standardDeviation(daughterHeights));

    // 母分散を計算する場合は、以下のように手動で計算できます
    // 母分散 = 標本分散 * (n-1)/n
    const fatherPopulationVariance = ss.variance(fatherHeights) * (fatherHeights.length - 1) / fatherHeights.length;
    const motherPopulationVariance = ss.variance(motherHeights) * (motherHeights.length - 1) / motherHeights.length;
    const sonPopulationVariance = ss.variance(sonHeights) * (sonHeights.length - 1) / sonHeights.length;
    const daughterPopulationVariance = ss.variance(daughterHeights) * (daughterHeights.length - 1) / daughterHeights.length;

    console.log("Father Height - Population Variance:", fatherPopulationVariance);
    console.log("Mother Height - Population Variance:", motherPopulationVariance);
    console.log("Son Height - Population Variance:", sonPopulationVariance);
    console.log("Daughter Height - Population Variance:", daughterPopulationVariance);

    // 母標準偏差を計算
    console.log("Father Height - Population Standard Deviation:", Math.sqrt(fatherPopulationVariance));
    console.log("Mother Height - Population Standard Deviation:", Math.sqrt(motherPopulationVariance));
    console.log("Son Height - Population Standard Deviation:", Math.sqrt(sonPopulationVariance));
    console.log("Daughter Height - Population Standard Deviation:", Math.sqrt(daughterPopulationVariance));
}

function draw() {
    // background(220);
    // ellipse(200, 200, 100, 100);
}