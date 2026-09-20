---
trigger: always_on
globs: ["src/**/*.{ts,vue}"]
---

# Lint After Code Change (コード変更後のリンターチェック)

**Activation:** This rule is **ALWAYS ON** for source files (`src/**/*.{ts,vue}`).

> **Positioning:** `senior-engineer-conduct.md` の「Verify After Change」原則を、
> ESLint/TypeScript の **自動検証** に具体化したルールです。

## 原則

AIによるコード変更は、人間のレビューが入る前にリンターエラーを持ち込むリスクがある。
変更の品質を機械的に保証するため、**コード変更の完了後に必ずリンターを実行**する。

## 行動手順

### 1. 変更完了時にリンターを実行する

`src/` 配下の `.ts` / `.vue` ファイルを1つ以上変更した場合、
作業の最後に以下のコマンドを実行して変更ファイルのリンターエラーがないことを確認する:

```bash
./node_modules/.bin/eslint <変更したファイルパス...>
```

- **全ファイルチェック（`npx eslint .`）は禁止。** 変更したファイルのみを対象にする（実行時間と関係ない問題の混入を防ぐ）。
- テストファイル（`__tests__/*.spec.ts`）も変更対象に含まれる場合はチェック対象に追加する。

### 2. エラーがあれば修正する

- リンターエラーが検出された場合、**ユーザーに報告した上で**修正を行う。
- 修正は ESLint ルールを無効化（`eslint-disable`）するのではなく、**コード自体を修正**することを優先する。
- `eslint-disable` の使用が真にやむを得ない場合は、その理由をコメントで明記する。

### 3. 修正が不要・不適切なケース

以下の場合はリンターチェックをスキップしてよい:

- ドキュメント・設定ファイルのみの変更（`.md`, `.json`, `.html` 等）
- リンターの実行がサンドボックスの権限制約で失敗する場合（ユーザーに手動確認を依頼する）

## よくある ESLint エラーと修正パターン

| ルール | 修正方法 |
|--------|----------|
| `@typescript-eslint/no-non-null-assertion` | `if (!value) return;` ガードに置換 |
| `@typescript-eslint/no-unused-vars` | 未使用importの除去 |
| `sonarjs/no-duplicate-string` | 3回以上の重複リテラルを定数に抽出 |
| `sonarjs/unused-import` | 未使用importの除去 |
| `no-underscore-dangle` | 先頭 `_` / `__` を除去し、意図を別手段（JSDoc等）で表現 |
| `no-await-in-loop` | `Promise.all()` で並列化 |
