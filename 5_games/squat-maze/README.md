# これは何？

Squat Mazeは、スクワットをしながら、迷路のような空間を移動するゲームです。
遊びながら筋トレができます。

## 遊び方

1. ゲームスタート
2. 右から左へ、壁が移動していきます。上下の壁や障害物に当たるとライフが減り、ライフが0になったらゲームオーバーです。
3. プレイヤーの位置は、頭の位置で決定されます。

## 設定

※初期リリースでは設定画面はなし

## ゲーム画面デザイン

mock/stitch_game_v3.htmlを参照

## 技術スタック

p5.js
ml5.js

## 実装方針

- p5.jsでゲーム画面を作成
- ml5.jsで姿勢推定を行い、プレイヤーの位置を決定
- プレイヤーの位置に応じて、壁を移動させる
- ライフが0になったらゲームオーバー
- ゲームオーバー画面で、スコアを表示 (スコアは移動距離)
- スコアに応じて、ランキングを表示

## 実装手順

1. p5.jsでゲーム画面を作成
2. ml5.jsで姿勢推定を行い、プレイヤーの位置を決定
3. 壁を生成し、移動させる
4. ライフが0になったらゲームオーバー
5. ゲームオーバー画面で、スコアを表示 (スコアは移動距離)
6. スコアに応じて、ランキングを表示

## 開発環境のセットアップ

### 前提条件

- [Node.js](https://nodejs.org/) (v18以上推奨)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- Java Runtime Environment (Firestore エミュレータに必要)

```bash
# Firebase CLI のインストール（未インストールの場合）
npm install -g firebase-tools

# Firebase にログイン
firebase login
```

### 依存パッケージのインストール

```bash
npm install
```

### 開発サーバーの起動

Firebase Emulator Suite（Hosting / Firestore / Auth）をローカルで起動します。
エミュレータのデータは `emulator-data/` に永続化されます。

```bash
npm run dev
```

起動後、以下のURLでアクセスできます。

| サービス | URL |
|---|---|
| ゲーム本体 | http://localhost:5000 |
| Emulator UI | http://localhost:5050 |
| Firestore | http://localhost:8080 |
| Auth | http://localhost:9099 |

> **注意:** ゲームはカメラ（Webカメラ）を使用するため、ブラウザのカメラ許可が必要です。

## 本番デプロイ

Firebase Hosting と Firestore ルールをデプロイします。
デプロイ先プロジェクトは `.firebaserc` で `squat-maze` に設定されています。

### 全サービスを一括デプロイ

```bash
firebase deploy
```

### 個別デプロイ

```bash
# Hosting（静的ファイル）のみ
firebase deploy --only hosting

# Firestore ルールのみ
firebase deploy --only firestore:rules

# Firestore インデックスのみ
firebase deploy --only firestore:indexes
```

デプロイ完了後、Firebase コンソールまたはターミナルに表示されるURLで本番環境にアクセスできます。
