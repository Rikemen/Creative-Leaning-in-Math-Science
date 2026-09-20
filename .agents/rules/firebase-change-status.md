

# Firebase 変更反映ステータス通知

**Activation:** This rule is **ALWAYS ON** for all Firebase-related and source code changes.

## 原則

Firebase プロジェクトでは、変更の種類によって**ローカル・エミュレーター・本番**への
反映タイミングと方法が異なる。変更作業の完了時にユーザーが「今どこに反映されていて、
どこに反映されていないか」を即座に把握できるよう、**反映ステータス表を毎回提示する**。

## 行動手順

### コード変更を完了した時点で、以下の表を提示する

変更したファイルの種類に応じて、各環境への反映状況を判定し、表形式で報告する。

#### 表のフォーマット

```markdown
### 🔄 反映ステータス

| 変更内容 | ローカル (dev) | エミュレーター | 本番 (Hosting) |
|---------|:---:|:---:|:---:|
| フロント (src/) | ✅ HMR自動 | ❌ 要ビルド | ❌ 要デプロイ |
| Functions (functions/) | — | ❌ 要再起動 | ❌ 要デプロイ |
| Firestore ルール | — | ✅ 自動 | ❌ 要デプロイ |
| Firestore インデックス | — | 不要 | ❌ 要デプロイ |

**本番反映コマンド:**
`firebase deploy --only functions,firestore`
```

### 環境別の反映方法一覧

| 変更種別 | ローカル (`npm run dev`) | エミュレーター (`emulators:start`) | 本番 |
|---------|----------------------|-------------------------------|------|
| **フロント (`src/`)**  | ✅ HMR で自動反映 | ❌ `npm run build` 後に再起動 | `npm run build && firebase deploy --only hosting` |
| **Cloud Functions (`functions/src/`)** | — 直接接続なし | ❌ エミュレーター再起動（自動検知する場合もあり） | `cd functions && npm run build && cd .. && firebase deploy --only functions` |
| **Firestore ルール (`firestore.rules`)** | — リモート参照 | ✅ エミュレーター起動時に自動読込 | `firebase deploy --only firestore:rules` |
| **Firestore インデックス (`firestore.indexes.json`)** | — リモート参照 | 不要（エミュレーターはインデックス不要） | `firebase deploy --only firestore` |
| **Storage ルール (`storage.rules`)** | — リモート参照 | ✅ エミュレーター起動時に自動読込 | `firebase deploy --only storage` |
| **`package.json` (functions)** | — | ❌ `npm install` + 再起動 | デプロイ時に自動インストール |

### 判定ルール

- **ローカル (`npm run dev`)**: `src/` の変更は Vite の HMR で即時反映。`functions/` の変更はローカルには無関係（リモートの Functions を直接呼ぶため）。
- **エミュレーター**: `firebase emulators:start` は起動時のコードを使う。Functions のソース変更後はエミュレーター再起動が必要（ビルド済みの `lib/` を参照するため、`npm run build` も必要）。
- **本番**: 全ての変更は明示的な `firebase deploy` が必要。

### 提示のタイミング

以下のいずれかに該当する作業が完了した時点で、ステータス表を提示する:

1. `functions/src/` 配下のファイルを変更した
2. `firestore.rules` または `firestore.indexes.json` を変更した
3. `storage.rules` を変更した
4. `src/` 配下のファイルを変更し、ユーザーが本番確認を想定している場合
5. ユーザーから「反映されていない」「エラーが出る」と報告があった場合

### 簡潔さの原則

- 変更していない項目は表から省略してよい
- ユーザーが次に実行すべきコマンドを**コピー可能な形式**で提示する
- 不要な解説は付けず、表 + コマンドのみで完結させる
