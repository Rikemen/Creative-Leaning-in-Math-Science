function setup() {
    createCanvas(windowWidth, windowHeight);

    console.log("=== #48：置換の実装 ===");

    // 1. 置換を関数として表現する。σ: 1→2、2→3、3→1。
    const sigma = new Permutation([2, 3, 1]);
    const sigmaFunction = (i) => sigma.apply(i);
    console.log("1. 置換を関数として表現する");
    console.log("σ(1)", sigmaFunction(1));
    console.log("σ(2)", sigmaFunction(2));
    console.log("σ(3)", sigmaFunction(3));
    console.log("恒等置換", Permutation.identity(3).toArray());

    // 2. 合成は右側から先に作用する。順序を入れ替えると結果が変わる。
    const alpha = new Permutation([2, 1, 3]);
    const beta = new Permutation([1, 3, 2]);
    console.log("2. 置換を合成する");
    console.log("α ∘ β（β → α）", alpha.compose(beta).toArray());
    console.log("β ∘ α（α → β）", beta.compose(alpha).toArray());

    // 3. σ⁻¹(σ(i)) = i。逆置換との合成は恒等置換になる。
    const inverse = sigma.inverse();
    console.log("3. 逆置換を求める");
    console.log("σ の逆置換", inverse.toArray());
    console.log("σ ∘ σ⁻¹", sigma.compose(inverse).toArray());

    // 4. (1 3 2) は 1→3→2→1。指定していない4は動かさない。
    const cycle = Permutation.cycle(4, [1, 3, 2]);
    console.log("4. 巡回置換を作る");
    console.log("巡回置換 (1 3 2)", cycle.toArray());

    // 5. (1 3) は1と3だけを入れ替える。
    const swap = Permutation.transposition(4, 1, 3);
    console.log("5. 互換を作る");
    console.log("互換 (1 3)", swap.toArray());

    // 6. [2,3,1] の転倒は (2,1), (3,1) の2組なので符号は +1。
    console.log("6. 置換の符号を求める");
    console.log("sgn σ", sigma.sign());
    console.log("sgn (1 3)", swap.sign());

    // 7. 符号 +1 は偶置換、-1 は奇置換。
    console.log("7. 偶置換・奇置換を判定する");
    console.log("σ は偶置換", sigma.isEven());
    console.log("σ は奇置換", sigma.isOdd());
    console.log("(1 3) は偶置換", swap.isEven());
    console.log("(1 3) は奇置換", swap.isOdd());
}

function draw() {
    background(176, 224, 230);
}
