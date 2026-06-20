

# KaTeX Math Formula Escaping (KaTeX数式エスケープ規約)

**Activation:** This rule is **ALWAYS ON** when writing LaTeX/KaTeX formulas in TypeScript/JavaScript string literals.

## 原則

KaTeX数式をTypeScript/JavaScriptの文字列リテラル（`"..."` や `'...'`）内に記述する際、
バックスラッシュのエスケープ階層を正確に理解しないと、数式が壊れる。
**このプロジェクトで過去に繰り返し発生した問題であり、再発は許容しない。**

## エスケープチェーン（必ず理解すること）

```
ツール出力 → ファイル上の文字 → JSランタイムの文字列 → KaTeXへの入力
```

| 段階 | `\frac` の例 | `\\` (改行) の例 |
|------|-------------|-----------------|
| KaTeXが受け取るべき文字 | `\frac` | `\\` |
| JSランタイムの文字列 | `\frac` | `\\` |
| ファイル上のTS文字列リテラル | `\\frac` | `\\\\` |
| ツール（write_to_file等）に渡す値 | `\\frac` | `\\\\` |

> **重要**: `write_to_file` / `replace_file_content` ツールは、渡した文字列を
> **そのままファイルに書き込む**（ツール側での追加エスケープは行われない）。

## 正しい書き方

```typescript
// ✅ 正しい — ファイル上で \\frac → ランタイムで \frac → KaTeX OK
const formula = "\\frac{a}{b}";

// ✅ 正しい — ファイル上で \\lim → ランタイムで \lim → KaTeX OK
const limit = "\\lim_{x \\to 0} f(x)";

// ✅ 正しい — ファイル上で \\left( → ランタイムで \left( → KaTeX OK
const paren = "\\left(\\frac{f}{g}\\right)'(x)";
```

## よくある間違い（厳禁）

```typescript
// ❌ 間違い — ファイル上で \\\\frac → ランタイムで \\frac → KaTeX エラー
const formula = "\\\\frac{a}{b}";

// ❌ 間違い — ファイル上で \frac → ランタイムで不正なエスケープ → 未定義動作
const formula = "\frac{a}{b}";
```

## 検証手順

### 1. 書き込み前の確認

KaTeX数式を含むファイルを作成・編集する前に、以下を自問する:
- 「ファイル上でバックスラッシュは **2つ** か?」（`\\frac`, `\\lim`, `\\to` 等）
- 「ツールに渡す文字列にバックスラッシュを **余分に追加していないか**?」

### 2. 書き込み後の確認

KaTeX数式を含むファイルを書き込んだ後、以下のコマンドで実ファイルのバックスラッシュ数を確認する:

```bash
# frac の前のバックスラッシュ数を確認（期待値: 2）
python3 -c "
with open('<ファイルパス>') as f:
    for i, line in enumerate(f, 1):
        if 'frac' in line or 'lim' in line:
            print(f'Line {i}: {line.rstrip()[:80]}')
" | head -5
```

### 3. 既存ファイルとの一貫性確認

新しい数式ファイルを作成する際は、既存の正しく動作しているファイルのエスケープパターンを `grep` で確認してから書く:

```bash
grep '\\\\frac\|\\\\lim\|\\\\sum' src/content/calculus/limits.ts | head -3
```

## 参考: プロジェクト内の正しいパターン

- `src/content/calculus/limits.ts` — `\\lim`, `\\frac`, `\\varepsilon` 等
- `src/content/calculus/derivative-coefficient.ts` — `\\lim`, `\\frac` 等
- `src/content/calculus/differentiation-rules.ts` — `\\frac`, `\\left`, `\\sum` 等
