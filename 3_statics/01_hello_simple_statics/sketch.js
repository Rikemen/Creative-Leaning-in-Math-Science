let data = [1, 2, 3, 4, 5];

// Using simple-statistics library with the ss namespace
let minimum = ss.min(data);
let maximum = ss.max(data);
let mean = ss.mean(data);
let median = ss.median(data);
let standardDeviation = ss.standardDeviation(data);
let sum = ss.sum(data);

console.log("Minimum:", minimum);
console.log("Maximum:", maximum);
console.log("Mean:", mean);
console.log("Median:", median);
console.log("Standard Deviation:", standardDeviation);
console.log("Sum:", sum);

// You can also use other methods like:
// ss.variance(data)
// ss.quantile(data, 0.25) // first quartile
// ss.quantile(data, 0.75) // third quartile
// ss.mode(data)
// ss.harmonicMean(data)
// ss.geometricMean(data)