/**
 * 固有値と固有ベクトルの記事データ
 * コンテンツをコンポーネントから分離することで、V2以降の複数単元対応を容易にする
 */
export const eigenvalueArticle = {
  title: '固有値と固有ベクトル',
  sections: [
    {
      heading: '🌟 固有値・固有ベクトルって何？',
      body: '行列Aをかけても「方向が変わらない」特別なベクトルのことを固有ベクトルといいます。そのとき、ベクトルが何倍に伸び縮みしたかを表す数が固有値です。',
      formulas: ['Av = \\lambda v'],
    },
    {
      heading: '📐 固有値の求め方',
      body: '固有値λを求めるには、「行列A - λI（単位行列のλ倍）」の行列式がゼロになるλを探します。これを固有方程式（特性方程式）といいます。',
      formulas: [
        '\\det(A - \\lambda I) = 0',
        '\\begin{vmatrix} a - \\lambda & b \\\\ c & d - \\lambda \\end{vmatrix} = 0',
      ],
    },
    {
      heading: '✏️ 具体例で見てみよう',
      body: '行列A = [[2, 1], [1, 2]] の固有値を求めてみましょう。特性方程式を解くと、λ = 3 と λ = 1 が得られます。',
      formulas: [
        'A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}',
        '(2 - \\lambda)^2 - 1 = 0',
        '\\lambda = 3, \\quad \\lambda = 1',
      ],
    },
  ],
}
