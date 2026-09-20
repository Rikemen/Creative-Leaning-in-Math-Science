

# Firebase デプロイ前検証

**Activation:** This rule is **ALWAYS ON** for Firebase-related changes.

## 原則

ローカルのフロントエンド（`npm run dev`）はリモートの Firebase サービス
（Cloud Functions, Firestore, Hosting）に接続する。
コード変更後にデプロイを忘れると、**ローカルの新コードがリモートの旧サービスを呼び出し**、
CORS エラーや権限エラーなど誤解を招くエラーが発生する。

## デプロイが必要な変更と対応コマンド

| 変更内容 | 必要なデプロイコマンド | 未デプロイ時の典型エラー |
|---------|---------------------|---------------------|
| Cloud Functions の追加・変更 | `firebase deploy --only functions` | CORS エラー / `net::ERR_FAILED` / `FirebaseError: internal` |
| Firestore セキュリティルール変更 | `firebase deploy --only firestore:rules` | `Missing or insufficient permissions` |
| Firestore インデックス追加 | `firebase deploy --only firestore` | `The query requires an index` |
| フロントエンドの変更 | `npm run build && firebase deploy --only hosting` | 変更が本番に反映されない |
| Storage ルール変更 | `firebase deploy --only storage` | Storage アクセス拒否 |

## 行動手順

### 1. 変更完了時にデプロイ要否を判定

コード変更が完了した時点で、上記の表に該当する変更があるか確認する。

### 2. テスト前にデプロイを案内

ユーザーがリモート環境でテストしようとしている場合、
**該当するデプロイコマンドを事前に案内**する。

### 3. エラー発生時の診断フロー

以下のエラーが報告された場合、**デプロイ忘れを第一疑い先**とする:

```
CORS policy: No 'Access-Control-Allow-Origin' header
→ Cloud Functions が未デプロイ（関数エンドポイントが存在しない）

Missing or insufficient permissions
→ Firestore ルールが未デプロイ

The query requires an index
→ Firestore インデックスが未デプロイ

The default Firebase app does not exist
→ initializeApp() の呼び出し漏れ（cloud-functions-new-service.md を参照）
```

## エミュレーター活用の推奨

デプロイせずにローカル完結でテストしたい場合は、Firebase Emulator Suite を推奨する:

```bash
firebase emulators:start
```

ただし、フロントエンド側でエミュレーターへの接続設定が必要:
- `connectFirestoreEmulator(db, '127.0.0.1', 8081)`
- `connectFunctionsEmulator(functions, '127.0.0.1', 5001)`
- `connectAuthEmulator(auth, 'http://127.0.0.1:9099')`

> **注意:** エミュレーター接続設定がプロジェクトに未導入の場合、
> 初回は設定作業が必要。都度デプロイの方が手軽な場合もある。
