

# Firestore クエリ安全性 (複合インデックス検証)

**Activation:** This rule is **ALWAYS ON** for Firestore query operations (`**/*.{ts,vue}`).

## 原則

Firestore は**単一フィールド**のクエリにはインデックスを自動作成するが、
**異なるフィールドを組み合わせるクエリ**には**複合インデックス（Composite Index）**の手動定義が必要。
未定義の場合、ランタイムで `The query requires an index` エラーが発生する。

## 複合インデックスが必要なパターン

以下のいずれかに該当するクエリを書いた場合、`firestore.indexes.json` への定義追加が**必須**:

| パターン | 例 | インデックス |
|---------|-----|------------|
| `where(A)` + `orderBy(B)` （A≠B） | `where('status','==','published')` + `orderBy('createdAt','desc')` | ❌ 自動作成されない |
| `where(A)` + `where(B)` （範囲比較を含む） | `where('age','>=',18)` + `where('city','==','Tokyo')` | ❌ 自動作成されない |
| `array-contains` + `orderBy` | `where('tags','array-contains','math')` + `orderBy('createdAt')` | ❌ 自動作成されない |
| `where(A)` のみ | `where('status','==','published')` | ✅ 自動作成 |
| `orderBy(A)` のみ | `orderBy('createdAt','desc')` | ✅ 自動作成 |

## 行動手順

### 1. クエリ作成時にインデックス要否を判定

Firestore クエリを新規作成・変更する際、上記パターンに該当するか確認する。

### 2. 該当する場合、`firestore.indexes.json` に定義を追加

```json
{
  "collectionGroup": "コレクション名",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "フィルタフィールド", "order": "ASCENDING" },
    { "fieldPath": "ソートフィールド", "order": "DESCENDING" }
  ]
}
```

- `queryScope`: サブコレクション内のクエリなら `"COLLECTION"`、コレクショングループクエリなら `"COLLECTION_GROUP"`
- `order`: クエリの `orderBy` 方向と一致させる（`asc` → `ASCENDING`, `desc` → `DESCENDING`）

### 3. デプロイを促す

インデックス定義を追加した場合、ユーザーに以下のデプロイを案内する:

```bash
firebase deploy --only firestore
```

> **注意:** インデックスの構築には数分かかる場合がある。構築完了前にクエリを実行するとエラーが継続する。

### 4. 既存クエリの確認

ファイルを変更する際、そのファイル内の既存 Firestore クエリも確認し、
未定義のインデックスがないか `firestore.indexes.json` と照合する。

## エラー発生時の対処

エラーメッセージ `The query requires an index` が発生した場合:

1. エラーメッセージ内のURLからコンソールでワンクリック作成が可能
2. ただし `firestore.indexes.json` にも定義を追加してコード管理する（再現性のため）

---

## トランザクションの read-before-write 制約

Firestore トランザクション（`db.runTransaction`）内では、
**全ての `transaction.get()`（読み取り）を `transaction.set()` / `update()` / `delete()`（書き込み）より先に実行しなければならない。**

違反した場合、ランタイムで以下のエラーが発生する:
```
Firestore transactions require all reads to be executed before all writes.
```

### 正しい構造

```typescript
await db.runTransaction(async (transaction) => {
  // ── READ フェーズ（全ての get を先に実行） ──
  const docA = await transaction.get(refA);
  const docB = await transaction.get(refB);

  // ── WRITE フェーズ（read 完了後に write） ──
  transaction.set(refC, { ... });
  transaction.update(refA, { ... });
  transaction.delete(refD);
});
```

### 行動手順

`db.runTransaction` を書く際:

1. トランザクション関数の**冒頭**に全ての `transaction.get()` をまとめる
2. `// ── READ フェーズ ──` / `// ── WRITE フェーズ ──` コメントで区切る
3. write 後に read が必要なロジックは、read を先に行い結果を変数に保持して後から参照する

### 背景

Firestore はトランザクションの一貫性を**楽観的ロック**で保証する。
`get()` で読み取ったドキュメントのバージョンを記録し、コミット時に
「読み取り時点から変更されていないか」を検証する。
write 後に read を挟むとこの検証順序が崩れるため、SDK が即座にエラーを投げる。
