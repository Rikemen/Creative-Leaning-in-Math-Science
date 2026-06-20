

# Cloud Functions 新規サービス追加チェックリスト

**Activation:** This rule is **ALWAYS ON** for Cloud Functions files (`functions/src/**/*.ts`).

## 原則

Cloud Functions に新しい Firebase サービス（Firestore, Auth, Storage 等）や
外部 API（Gemini, Secret Manager 等）を初めて導入する際、初期化・権限・依存関係の
設定漏れがランタイムエラーの原因となる。**コードを書く前にチェックリストを確認**せよ。

## チェックリスト

### 1. Firebase Admin SDK の初期化

`firebase-admin/*` からの import（`getFirestore`, `getAuth`, `getStorage` 等）を
**プロジェクト内で初めて**使用する場合:

- [ ] `functions/src/index.ts` の先頭で `initializeApp()` が呼ばれているか確認
- [ ] 未呼出の場合、以下を追加:

```typescript
import { initializeApp } from "firebase-admin/app";
initializeApp();
```

**検証方法:**
```bash
grep -r "initializeApp" functions/src/index.ts
```

> **背景:** `getFirestore()` 等は内部で「デフォルトアプリ」を参照する。
> `initializeApp()` が未実行だと `The default Firebase app does not exist` エラーが発生する。
> 既存関数が Firestore を使っていなければ、このエラーは顕在化しない。

### 2. Secret Manager（`defineSecret`）

Cloud Functions で秘密情報（API キー等）を使用する場合:

- [ ] **Secret Manager API** がプロジェクトで有効か確認
- [ ] **IAM 権限**: デプロイユーザーに `roles/secretmanager.admin` が付与されているか確認
- [ ] **シークレットの登録**: `firebase functions:secrets:set <SECRET_NAME>` で値を設定済みか確認
- [ ] **ラッパー関数**: `defineSecret()` は `onCall` / `onRequest` の `secrets` オプションに渡す

```typescript
import { defineSecret } from "firebase-functions/params";
const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const myFunction = onCall(
  { secrets: [geminiApiKey] },  // ← ここで紐付け
  async (request) => { /* ... */ }
);
```

### 3. 外部パッケージの追加

新しい npm パッケージを `functions/` に追加する場合:

- [ ] `functions/package.json` の `dependencies` に追記
- [ ] **サンドボックス制約**: `npm install` はサンドボックス内で実行不可の場合がある
- [ ] ユーザーに以下のコマンド実行を明示的に依頼する:

```bash
cd functions && npm install
```

### 4. Firestore セキュリティルール

新しいコレクション/サブコレクションにアクセスする関数を追加する場合:

- [ ] `firestore.rules` に該当コレクションのルールが定義されているか確認
- [ ] サーバーのみ書き込み可のコレクションは `allow write: if false;` を設定
- [ ] クライアントから読み取るコレクションは適切な `allow read` ルールを設定

### 5. ビルド & デプロイ

新しい関数を追加した後:

- [ ] `cd functions && npm run build` でビルド成功を確認
- [ ] `firebase deploy --only functions` でデプロイ
- [ ] `firebase functions:log --only <関数名>` でランタイムエラーがないか確認
