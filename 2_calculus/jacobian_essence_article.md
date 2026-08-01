# 微分の本質から理解するヤコビ行列・ヤコビアン・基底変換・置換積分

## はじめに

ヤコビ行列やヤコビアンが分かりにくくなる大きな理由は、次の概念が別々に説明されることにあります。

- 1変数関数の微分
- 多変数関数の勾配
- 多変数ベクトル値関数のヤコビ行列
- 基底変換・座標変換
- 置換積分のヤコビアン

しかし、これらはすべて次の一つの考え方でつながっています。

> **微分とは、関数による微小な変化を、線形変換によって一次近似するものである。**

この線形変換を座標で表したものがヤコビ行列であり、その線形変換が面積や体積を何倍にするかを表したものがヤコビアンです。

---

## 1. 1変数関数の微分は「変化量の一次近似」

1変数関数

\[
y=f(x)
\]

を考えます。入力を \(h\) だけ変化させたとき、出力の実際の変化量は

\[
\Delta f=f(x+h)-f(x)
\]

です。

微分可能であれば、\(h\) が小さいとき、

\[
f(x+h)=f(x)+f'(x)h+o(|h|)
\]

と書けます。したがって、

\[
\boxed{\Delta f\approx f'(x)h}
\]

です。

ここで重要なのは、\(f'(x)\) そのものが変化量なのではないことです。

- \(h\)：入力の変化量
- \(f'(x)\)：入力変化を出力変化へ変換する倍率
- \(f'(x)h\)：出力変化の一次近似

つまり、1変数関数の微分は、微小な入力変化 \(h\) を、微小な出力変化 \(f'(x)h\) へ写す線形変換です。

\[
h\longmapsto f'(x)h
\]

1次元では線形変換が一つの数で表せるため、微分は単なる「傾き」に見えます。

---

## 2. 多変数関数では入力の変化がベクトルになる

次に、2変数スカラー値関数

\[
z=f(x,y)
\]

を考えます。

入力の変化は一つの数ではなく、

\[
\Delta\mathbf{x}
=
\begin{pmatrix}
\Delta x\\
\Delta y
\end{pmatrix}
\]

というベクトルです。

このとき、出力の変化量は

\[
\Delta f
=
f(x+\Delta x,y+\Delta y)-f(x,y)
\]

です。

微分可能であれば、

\[
\Delta f
\approx
\frac{\partial f}{\partial x}\Delta x
+
\frac{\partial f}{\partial y}\Delta y
\]

と一次近似できます。

これは、入力ベクトル \(\Delta\mathbf{x}\) を一つの数 \(\Delta f\) に写す線形変換です。

\[
Df_{(x,y)}(\Delta\mathbf{x})
=
\begin{pmatrix}
f_x & f_y
\end{pmatrix}
\begin{pmatrix}
\Delta x\\
\Delta y
\end{pmatrix}
\]

ここで

\[
Df_{(x,y)}
=
\begin{pmatrix}
f_x & f_y
\end{pmatrix}
\]

は、微分という線形写像の行列表現です。

### 勾配との関係

勾配は

\[
\nabla f
=
\begin{pmatrix}
f_x\\
f_y
\end{pmatrix}
\]

なので、

\[
Df_{(x,y)}(\Delta\mathbf{x})
=
\nabla f\cdot\Delta\mathbf{x}
\]

と書けます。

厳密には、

- 微分 \(Df\)：入力ベクトルを数へ写す線形写像
- 勾配 \(\nabla f\)：内積を使って、その線形写像をベクトルとして表したもの

です。

多変数関数では方向によって変化率が異なります。しかし勾配を知れば、任意方向 \(\mathbf{u}\) の方向微分を

\[
D_{\mathbf{u}}f=\nabla f\cdot\mathbf{u}
\]

として求められます。したがって勾配は、多変数関数の局所的な変化率をまとめて持つベクトルだといえます。

---

## 3. 入力も出力もベクトルなら、微分は行列になる

今度は、多変数ベクトル値関数

\[
\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^m
\]

を考えます。

\[
\mathbf{F}(\mathbf{x})
=
\begin{pmatrix}
F_1(\mathbf{x})\\
\vdots\\
F_m(\mathbf{x})
\end{pmatrix}
\]

入力を \(\Delta\mathbf{x}\) だけ変えたとき、出力の変化は

\[
\Delta\mathbf{F}
=
\mathbf{F}(\mathbf{x}+\Delta\mathbf{x})
-
\mathbf{F}(\mathbf{x})
\]

です。

微分可能であれば、

\[
\mathbf{F}(\mathbf{x}+\Delta\mathbf{x})
=
\mathbf{F}(\mathbf{x})
+
D\mathbf{F}_{\mathbf{x}}(\Delta\mathbf{x})
+
o(\|\Delta\mathbf{x}\|)
\]

となります。したがって、

\[
\boxed{
\Delta\mathbf{F}
\approx
D\mathbf{F}_{\mathbf{x}}(\Delta\mathbf{x})
}
\]

です。

ここで \(D\mathbf{F}_{\mathbf{x}}\) は、入力ベクトルを出力ベクトルへ写す線形写像です。

\[
D\mathbf{F}_{\mathbf{x}}:
\mathbb{R}^n\to\mathbb{R}^m
\]

入力も出力もベクトルであるため、この線形写像は基底を選ぶと行列で表されます。その行列がヤコビ行列です。

---

## 4. なぜ線形写像は行列で表せるのか

2次元から2次元への線形写像

\[
L:\mathbb{R}^2\to\mathbb{R}^2
\]

を考えます。

標準基底を

\[
\mathbf{e}_1=
\begin{pmatrix}1\\0\end{pmatrix},
\qquad
\mathbf{e}_2=
\begin{pmatrix}0\\1\end{pmatrix}
\]

とすると、任意のベクトルは

\[
\mathbf{x}=x\mathbf{e}_1+y\mathbf{e}_2
\]

と書けます。

線形性より、

\[
L(\mathbf{x})
=xL(\mathbf{e}_1)+yL(\mathbf{e}_2)
\]

です。

したがって、\(L\) が基底ベクトルをどこへ写すかが分かれば、すべての入力に対する出力が決まります。

そこで、

\[
A=
\begin{pmatrix}
|&|\\
L(\mathbf{e}_1)&L(\mathbf{e}_2)\\
|&|
\end{pmatrix}
\]

と、基底の行き先を列に並べます。すると、

\[
L(\mathbf{x})=A\mathbf{x}
\]

となります。

つまり、行列とは

> **線形写像が各基底方向をどこへ写すかを、列として並べたもの**

です。

---

## 5. ヤコビ行列とは何か

\[
\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^m
\]

のヤコビ行列は、

\[
\boxed{
J_{\mathbf{F}}(\mathbf{x})
=
\begin{pmatrix}
\dfrac{\partial F_1}{\partial x_1}&\cdots&\dfrac{\partial F_1}{\partial x_n}\\
\vdots&&\vdots\\
\dfrac{\partial F_m}{\partial x_1}&\cdots&\dfrac{\partial F_m}{\partial x_n}
\end{pmatrix}
}
\]

です。

そして、

\[
\boxed{
\Delta\mathbf{F}
\approx
J_{\mathbf{F}}(\mathbf{x})\Delta\mathbf{x}
}
\]

となります。

厳密には、

- 微分 \(D\mathbf{F}_{\mathbf{x}}\)：線形写像そのもの
- ヤコビ行列 \(J_{\mathbf{F}}(\mathbf{x})\)：基底を選んだときの行列表現

です。

### ヤコビ行列の列の意味

第 \(j\) 列は

\[
\frac{\partial\mathbf{F}}{\partial x_j}
=
\begin{pmatrix}
\dfrac{\partial F_1}{\partial x_j}\\
\vdots\\
\dfrac{\partial F_m}{\partial x_j}
\end{pmatrix}
\]

です。

これは、入力を \(x_j\) 方向へ微小に動かしたとき、出力ベクトル全体がどう変化するかを表します。

実際、入力空間の標準基底 \(\mathbf{e}_j\) に対して、

\[
J_{\mathbf{F}}\mathbf{e}_j
\]

を計算すると、ヤコビ行列の第 \(j\) 列が得られます。

### ヤコビ行列の行の意味

第 \(i\) 行は

\[
\begin{pmatrix}
\dfrac{\partial F_i}{\partial x_1}&\cdots&\dfrac{\partial F_i}{\partial x_n}
\end{pmatrix}
=(\nabla F_i)^T
\]

です。

これは、出力成分 \(F_i\) が、各入力変数の変化にどう反応するかをまとめたものです。

したがって、

- 列：一つの入力方向が、出力全体をどう変えるか
- 行：一つの出力成分が、入力全体にどう反応するか

と解釈できます。

---

## 6. ヤコビアンとは何か

日本語では、ヤコビ行列の行列式をヤコビアンと呼ぶことが一般的です。

\[
\boxed{
\text{ヤコビアン}
=
\det J_{\mathbf{F}}
}
\]

ただし、通常の行列式が定義できるのは、入力次元と出力次元が同じ場合です。

\[
\mathbf{F}:\mathbb{R}^n\to\mathbb{R}^n
\]

ヤコビ行列が微小ベクトルの変換を表すのに対し、ヤコビアンは微小面積・微小体積の倍率を表します。

2次元なら、ヤコビ行列の2本の列ベクトルが作る平行四辺形の符号付き面積が

\[
\det J
\]

です。

したがって、

- \(|\det J|>1\)：局所的に面積を拡大
- \(0<|\det J|<1\)：局所的に面積を縮小
- \(\det J<0\)：面積倍率に加え、向きが反転
- \(\det J=0\)：一次近似では少なくとも1方向が潰れ、局所的に逆変換できない

と解釈できます。

---

## 7. 基底変換とヤコビ行列の関係

### 7.1 線形な基底変換

古い座標系の基底で、新しい基底ベクトルを

\[
\mathbf{b}_1,
\mathbf{b}_2
\]

と表します。

新座標での成分を

\[
\mathbf{u}
=
\begin{pmatrix}u\\v\end{pmatrix}
\]

とすると、同じ幾何学的ベクトルの古い座標での成分は

\[
\mathbf{x}
=
u\mathbf{b}_1+v\mathbf{b}_2
\]

です。

新基底を列に並べた行列を

\[
B=
\begin{pmatrix}
|&|\\
\mathbf{b}_1&\mathbf{b}_2\\
|&|
\end{pmatrix}
\]

とすれば、

\[
\boxed{\mathbf{x}=B\mathbf{u}}
\]

となります。

ここで \(B\) は、「新しい座標で表された成分」を「古い座標で表された成分」へ変換する行列です。

この行列の列が新基底ベクトルになるのは、線形写像の行列と同じ理由です。

### 7.2 非線形な座標変換

極座標のような座標変換は、全体としては線形ではありません。

\[
\mathbf{x}=\Phi(\mathbf{u})
\]

たとえば、

\[
\begin{pmatrix}x\\y\end{pmatrix}
=
\begin{pmatrix}
r\cos\theta\\
r\sin\theta
\end{pmatrix}
\]

です。

しかし、ある点の近くでは

\[
\Delta\mathbf{x}
\approx
J_\Phi(\mathbf{u})\Delta\mathbf{u}
\]

と線形近似できます。

ヤコビ行列の列

\[
\frac{\partial\Phi}{\partial u_1},
\quad
\frac{\partial\Phi}{\partial u_2}
\]

は、新座標の各座標方向が、古い座標空間の中でどの方向と長さを持つかを表します。

したがって、非線形座標変換のヤコビ行列は、各点における

> **局所的な基底変換行列**

のような役割を持ちます。

ただし、通常の基底変換行列が空間全体で一定であるのに対し、非線形座標変換のヤコビ行列は位置によって変化します。

---

## 8. 置換積分でヤコビアンが現れる理由

元の積分を

\[
\iint_R g(x,y)\,dx\,dy
\]

とします。以下では、座標変換が対象領域で十分滑らかで、一対一に対応し、必要な点でヤコビアンが0でない場合を考えます。

新しい変数 \((u,v)\) を導入し、古い座標を新しい座標で

\[
x=x(u,v),
\qquad
y=y(u,v)
\]

と表します。

すなわち、

\[
\Phi(u,v)
=
\begin{pmatrix}
x(u,v)\\y(u,v)
\end{pmatrix}
\]

です。

新座標における微小変化は

\[
\Delta\mathbf{u}
=
\begin{pmatrix}du\\dv\end{pmatrix}
\]

です。これを古い座標での微小変化へ写すと、

\[
\begin{pmatrix}dx\\dy\end{pmatrix}
\approx
\frac{\partial(x,y)}{\partial(u,v)}
\begin{pmatrix}du\\dv\end{pmatrix}
\]

となります。

使うヤコビ行列は、

\[
\boxed{
\frac{\partial(x,y)}{\partial(u,v)}
=
\begin{pmatrix}
\dfrac{\partial x}{\partial u}&\dfrac{\partial x}{\partial v}\\
\dfrac{\partial y}{\partial u}&\dfrac{\partial y}{\partial v}
\end{pmatrix}
}
\]

です。

### 微小長方形が微小平行四辺形になる

\(uv\) 平面上の小さな長方形の2辺は、

\[
\begin{pmatrix}du\\0\end{pmatrix},
\qquad
\begin{pmatrix}0\\dv\end{pmatrix}
\]

です。

ヤコビ行列を作用させると、\(xy\) 平面ではそれぞれ

\[
\frac{\partial\Phi}{\partial u}du,
\qquad
\frac{\partial\Phi}{\partial v}dv
\]

になります。

この2本のベクトルが作る平行四辺形の面積は、

\[
\left|
\det
\frac{\partial(x,y)}{\partial(u,v)}
\right|
du\,dv
\]

です。

したがって、

\[
\boxed{
dx\,dy
=
\left|
\det
\frac{\partial(x,y)}{\partial(u,v)}
\right|
du\,dv
}
\]

となります。

そして置換積分は、

\[
\boxed{
\iint_R g(x,y)\,dx\,dy
=
\iint_S
 g(x(u,v),y(u,v))
\left|
\det
\frac{\partial(x,y)}{\partial(u,v)}
\right|
du\,dv
}
\]

です。

絶対値を付けるのは、積分に必要なのが向き付き面積ではなく、正の面積だからです。

---

## 9. 置換積分で「どちら向きのヤコビ行列」を使うのか

最も間違えにくい考え方は次です。

> **新しい座標の微小変化を、元の積分で使っていた古い座標の微小変化へ変換する。**

元の積分が \(dx\,dy\) で、置換後が \(du\,dv\) なら、原則として使うのは

\[
\boxed{
\frac{\partial(\text{古い変数})}
{\partial(\text{新しい変数})}
}
\]

です。

つまり、

\[
\boxed{
\frac{\partial(x,y)}{\partial(u,v)}
}
\]

を使います。

覚え方は、

\[
\begin{pmatrix}du\\dv\end{pmatrix}
\xrightarrow{\;J\;}
\begin{pmatrix}dx\\dy\end{pmatrix}
\]

です。

逆向きの関係

\[
u=u(x,y),
\qquad
v=v(x,y)
\]

しか分からない場合、局所的に逆変換可能なら、

\[
\left|
\det
\frac{\partial(x,y)}{\partial(u,v)}
\right|
=
\frac{1}{
\left|
\det
\frac{\partial(u,v)}{\partial(x,y)}
\right|}
}
\]

を使えます。

---

## 10. 具体例1：縦横の拡大

座標変換を

\[
x=2u,
\qquad
y=3v
\]

とします。

ヤコビ行列は、

\[
\frac{\partial(x,y)}{\partial(u,v)}
=
\begin{pmatrix}
2&0\\
0&3
\end{pmatrix}
\]

です。

第1列

\[
\begin{pmatrix}2\\0\end{pmatrix}
\]

は、\(u\) 方向の単位変化が \(x\) 方向の長さ2の変化になることを表します。

第2列

\[
\begin{pmatrix}0\\3\end{pmatrix}
\]

は、\(v\) 方向の単位変化が \(y\) 方向の長さ3の変化になることを表します。

行列式は

\[
\det J=2\times3=6
\]

なので、面積は6倍になります。

\[
\boxed{dx\,dy=6\,du\,dv}
\]

これは、\(uv\) 平面上の面積1の正方形が、\(xy\) 平面では縦3・横2の長方形になり、面積6になることを意味します。

---

## 11. 具体例2：極座標

極座標変換は、

\[
x=r\cos\theta,
\qquad
y=r\sin\theta
\]

です。

ヤコビ行列は、

\[
\frac{\partial(x,y)}{\partial(r,\theta)}
=
\begin{pmatrix}
\cos\theta&-r\sin\theta\\
\sin\theta&r\cos\theta
\end{pmatrix}
\]

です。

### 第1列の意味

\[
\frac{\partial(x,y)}{\partial r}
=
\begin{pmatrix}
\cos\theta\\
\sin\theta
\end{pmatrix}
\]

これは、\(r\) を増やすと半径方向へ進むことを表します。長さは1です。

### 第2列の意味

\[
\frac{\partial(x,y)}{\partial\theta}
=
\begin{pmatrix}
-r\sin\theta\\
r\cos\theta
\end{pmatrix}
\]

これは、\(\theta\) を増やすと円周方向へ進むことを表します。長さは \(r\) です。

つまり、微小な \(d\theta\) は実空間では長さ \(r\,d\theta\) の円弧に対応します。

行列式は、

\[
\det
\frac{\partial(x,y)}{\partial(r,\theta)}
=r
\]

なので、

\[
\boxed{dx\,dy=r\,dr\,d\theta}
\]

です。

これは、\(r\theta\) 座標上の小さな長方形 \(dr\,d\theta\) が、\(xy\) 平面では

- 半径方向の長さ：\(dr\)
- 円周方向の長さ：約 \(r\,d\theta\)

を持つ微小領域になるためです。

その面積は

\[
dr\times r\,d\theta
=r\,dr\,d\theta
\]

となります。

---

## 12. 合成関数と連鎖律から見た統一

座標変換

\[
\mathbf{x}=\Phi(\mathbf{u})
\]

の後に関数

\[
\mathbf{y}=\mathbf{F}(\mathbf{x})
\]

を適用すると、合成関数は

\[
\mathbf{y}=\mathbf{F}(\Phi(\mathbf{u}))
\]

です。

微小変化は、

\[
\Delta\mathbf{x}
\approx
J_\Phi(\mathbf{u})\Delta\mathbf{u}
\]

さらに、

\[
\Delta\mathbf{y}
\approx
J_{\mathbf{F}}(\mathbf{x})\Delta\mathbf{x}
\]

なので、

\[
\Delta\mathbf{y}
\approx
J_{\mathbf{F}}(\Phi(\mathbf{u}))
J_\Phi(\mathbf{u})
\Delta\mathbf{u}
\]

となります。

したがって、

\[
\boxed{
J_{\mathbf{F}\circ\Phi}
=
J_{\mathbf{F}}\,J_\Phi
}
\]

です。

これは多変数版の連鎖律です。

「微小変化を次の空間へ送り、さらに次の空間へ送る」という変換の合成が、行列の積になることを表しています。

---

## 13. よくある混同

### 13.1 ヤコビ行列とヤコビアン

- ヤコビ行列：微小ベクトルを変換する行列
- ヤコビアン：ヤコビ行列の行列式。微小面積・体積の倍率

\[
\Delta\mathbf{F}
\approx
J\Delta\mathbf{x}
\]

に使うのがヤコビ行列で、

\[
dx_1\cdots dx_n
=
|\det J|\,du_1\cdots du_n
\]

に使うのがヤコビアンです。

### 13.2 勾配とヤコビ行列

スカラー値関数

\[
f:\mathbb{R}^n\to\mathbb{R}
\]

では、ヤコビ行列は \(1\times n\) の行ベクトルです。

\[
J_f=
\begin{pmatrix}
f_{x_1}&\cdots&f_{x_n}
\end{pmatrix}
\]

その転置が勾配です。

\[
\nabla f=J_f^T
\]

### 13.3 基底変換と非線形座標変換

通常の基底変換は線形であり、変換行列は空間全体で一定です。

一方、極座標のような非線形座標変換では、ヤコビ行列は位置によって変化します。したがって、ヤコビ行列は「各点における局所的な基底変換」と理解するとよいでしょう。

### 13.4 \(dx\,dy=|\det J|du\,dv\) の意味

これは、個々の記号を通常の数のように掛け合わせた恒等式というより、局所的な面積要素の変換則です。

\[
\text{新座標での微小面積}
\xrightarrow{|\det J|}
\text{古い座標での微小面積}
\]

という意味です。

---

## 14. 全体を一つの流れで整理する

### 1変数関数

\[
\Delta f\approx f'(x)\Delta x
\]

微分は、入力変化を出力変化へ変換する倍率です。

### 多変数スカラー値関数

\[
\Delta f
\approx
Df(\Delta\mathbf{x})
=
\nabla f\cdot\Delta\mathbf{x}
\]

微分は、入力ベクトルを出力の数へ写す線形写像です。

### 多変数ベクトル値関数

\[
\Delta\mathbf{F}
\approx
J_{\mathbf{F}}\Delta\mathbf{x}
\]

微分は、入力ベクトルを出力ベクトルへ写す線形写像であり、その行列表現がヤコビ行列です。

### 座標変換

\[
\Delta\mathbf{x}
\approx
J_\Phi\Delta\mathbf{u}
\]

ヤコビ行列は、新座標の微小変化を古い座標の微小変化へ写します。

### 置換積分

\[
dx_1\cdots dx_n
=
|\det J_\Phi|\,du_1\cdots du_n
\]

ヤコビアンは、座標変換による微小面積・体積の倍率です。

---

## まとめ

微分・ヤコビ行列・ヤコビアン・基底変換・置換積分は、次のように一本につながります。

1. 関数の実際の変化は、微小範囲では線形変換で一次近似できる。
2. その線形変換が微分である。
3. 入力と出力がベクトルなら、微分の行列表現がヤコビ行列になる。
4. ヤコビ行列の列は、各入力基底方向が出力空間でどう変化するかを表す。
5. 座標変換では、ヤコビ行列が新座標の局所基底を古い座標空間で表す。
6. その列ベクトルが作る平行四辺形・平行六面体の面積や体積が、行列式によって求まる。
7. その局所的な面積・体積倍率がヤコビアンであり、置換積分の補正係数になる。

最も本質的な式は、次の二つです。

\[
\boxed{
\Delta\mathbf{F}
\approx
J_{\mathbf{F}}(\mathbf{x})\Delta\mathbf{x}
}
\]

\[
\boxed{
dx_1\cdots dx_n
=
\left|\det J_\Phi(\mathbf{u})\right|
du_1\cdots du_n
}
\]

前者は「微小ベクトルの変換」、後者は「微小面積・体積の変換」です。

この二つを区別しながら結び付けると、ヤコビ行列とヤコビアンの役割が整理できます。
