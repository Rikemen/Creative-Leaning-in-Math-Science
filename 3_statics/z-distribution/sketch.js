window.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('normalChart').getContext('2d');

    // 標準正規分布の確率密度関数
    function normalPDF(x, mean = 0, stddev = 1) {
        return (1 / (stddev * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mean) / stddev, 2));
    }

    // 小数点3桁目を四捨五入する関数
    function roundToThreeDecimals(num) {
        return Math.round(num * 1000) / 1000;
    }

    const mean1 = 0;
    const mean2 = 1;
    const stddev1 = 1;
    const stddev2 = 2;
    const stddev3 = 0.75;
    
    
    const xValues = [];
    const yValues1 = [];
    const yValues2 = [];
    const yValues3 = [];
    const yValues4 = [];

    for (let i = -400; i <= 400; i += 4) {
        let x = i / 100;
        xValues.push(roundToThreeDecimals(x));
        yValues1.push(normalPDF(x, mean1, stddev1));
        yValues2.push(normalPDF(x, mean2, stddev1));
        yValues3.push(normalPDF(x, mean1, stddev2));
        yValues4.push(normalPDF(x, mean1, stddev3));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [
                {
                    label: '標準正規分布 (μ=0, σ=1)',
                    data: yValues1,
                    fill: false,
                    borderWidth: 1,
                    borderColor: 'blue',
                    tension: 0.1
                },
                {
                    label: '正規分布 (μ=1, σ=1)',
                    data: yValues2,
                    fill: false,
                    borderWidth: 1,
                    borderColor: 'red',
                    tension: 0.1
                },
                {
                    label: '正規分布 (μ=0, σ=2)',
                    data: yValues3,
                    fill: false,
                    borderWidth: 1,
                    borderColor: 'yellow',
                    tension: 0.1
                },
                {
                    label: '正規分布 (μ=0, σ=0.75)',
                    data: yValues4,
                    fill: false,
                    borderWidth: 1,
                    borderColor: 'green',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Zスコア'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '確率密度'
                    }
                }
            }
        }
    });
});
