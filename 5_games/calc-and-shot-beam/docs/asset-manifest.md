# 素材台帳

2026-09-09：初版素材を制作。ゲームへの本組み込み・子供との音量試遊は未実施。

2026-09-11：Loop 15の[素材仕様](asset-spec.md)を確定。以下のv1採用は初版プレビューでの採用を意味し、新仕様への適合・ゲーム用採用は未確認。Loop 16〜19では同仕様の共通キャンバス・肩接合点・発射点で検品し、採用版を別の固定名へ書き出す。初版ファイルと生成記録は維持する。

| 素材ID | 用途 | 制作元・出典 | 利用条件 | 採用版 | 配信パス |
| --- | --- | --- | --- | --- | --- |
| city | 背景 | 内蔵image_genの初版を採用・WebP書き出し | 生成素材。外部素材の転用なし | v2（Loop 20組み込み済み） | public/assets/images/city.webp |
| hero-back | 後頭部と肩 | 内蔵image_gen、初版の参照編集 | オリジナルヒーローの生成素材 | v2 | public/assets/images/hero-back.png |
| arms-idle | 待機腕 | 内蔵image_genの初版を再採用・サイズ統一 | 同系統の銀赤配色。透過PNG | v2 | public/assets/images/arms-idle.png |
| arms-fire | 発射腕 | 内蔵image_genの初版を再採用・サイズ統一 | 同系統の銀赤配色。透過PNG | v2 | public/assets/images/arms-fire.png |
| start / barrier / break / finish / button | 効果音5種 | assets-source/audio/generate_sfx.py | 数式とseedから合成。外部音源・既存作品の音なし | v1 | public/assets/audio/*-v1.wav |
| beam-fire / beam-loop | ビームの発射・持続音 | assets-source/audio/generate_sfx.py | オリジナルDSP合成。外部音源なし | v2 | public/assets/audio/beam-*-v2.wav |
| timer / cards / pause / mute | アイコン4種 | 手書きSVG | プロジェクト用の図形。外部アイコン素材なし | v1 | public/assets/icons/*.svg |

UI参考画像は `../system-design/dev-plans/reference-assets/ui-concept-v1.png`。画面設計用であり、そのまま本番背景にしない。

## 確認と使い方

- 開発サーバーの `/asset-preview.html` を通常のブラウザで開く。外部SDK・Firebase接続不要。待機／発射ボタンで合成を切替。音は各プレーヤーの再生ボタンで確認する。
- [機械可読マニフェスト](../public/assets/manifest-v1.json)のsrcは `public/assets/` 基準。
- 制作元PNGを `assets-source/images/` に保存し、配信用コピーを `public/assets/images/` に配置。元データの編集・リサイズ・透過加工はしていない。
- [生成プロンプト](../assets-source/prompts/imagegen-v1.json)に実際の指示を保存。内蔵image_genを使用し、CLI/APIキー方式は使っていない。
- 待機腕の最初の2案は背景が市松模様の不透過画像だったため不採用。作り直した透明PNGだけを配信用に採用した。
- 採用キャラクター3枚のRGBAと透明ピクセルの存在を確認。画像の寸法は生成結果を優先し、指定サイズへリサイズしたとは扱わない。
- 音源は44.1kHz、16bit、モノラルWAV。ピーク・RMS・長さは [v1レポート](../assets-source/audio/sfx-report-v1.json)と [ビームv2レポート](../assets-source/audio/sfx-report-v2.json)を参照。クリッピングを避けた初期音量で、聴感と子供の好みの確認は別途必要。
- ビームは0.44秒の発射音と周期1.6秒の持続音を重ねる。持続音は開始時、両音は停止時に短い音量フェードを加える。

## 残る調整

2026-09-16：ビームを発射・持続の2音へ更新。短い衝撃と下降レーザー、低音・電気的な倍音・脈動を重ねる。発射音0.32・持続音0.24で、マウスとカメラ共通。[ビーム効果音の検証](beam-audio-verification.md)。旧ビームと他5効果音はバイト一致で保持。実スピーカー試聴は未確認。

Loop 21〜25：画像の前後関係はユーザー指示により腕→体へ変更。WAV6種をゲームへ接続し、音量はビーム0.18・その他0.35、発射の開始・停止フェード32ms。[検証記録](loop25-verification.md)。ブラウザ再生・消音・欠損時の継続は確認済み。実機試聴と最終音量は未確認。

2026-09-14 Loop 20：背景・人物3枚をゲームへ組み込み済み。[検証記録](loop20-verification.md)。人物の出典・採否・実行プロンプトは [hero-layers-v2.json](../assets-source/prompts/hero-layers-v2.json)、原画は `assets-source/images/<id>/v2/original.png`。1024px書き出し後、仕様版2の実測点補正で合成。初版プレビュー用manifest-v1は保存し、ゲーム用マニフェストは `public/js/render/assets.js`。未デプロイ。

2026-09-14：背景は [Loop 16検証記録](loop16-verification.md) のとおり1600×900・34,020 bytesのWebPを採用済み。[制作元と処理記録](../assets-source/prompts/city-v2.json)。初版PNGとプレビュー用manifest-v1は保存し、人物素材3枚は引き続き候補。背景のゲームへの接続はLoop 20。

後頭部・待機腕・発射腕は別画像で、肩の接合・線の太さ・腕位置は素材仕様に合わせて調整する。素材確認ページは構図の試作であり、身体操作と連動する完成ゲームではない。人物画像の軽量化は採用・組み込み時に行う。数字・カード・HP・光線はコードで描画し、画像素材に含めない。

## 今回の検証結果

- [素材QA記録](asset-qa-v1.json)：PNG4枚のデコード、キャラクター3枚の透過、WAV6種のデコードとクリッピングなし、SVG4種の構文、プレビューの参照先を確認済み。
- `node --check public/js/ui/asset-preview.js`：PASS。
- ローカルHTTP配信で素材ページを表示し、待機→発射の画像切替、青いビームと対象カードの表示を目視確認。
- ビーム音のブラウザプレーヤーで再生→一時停止を確認。音の聴感評価、子供向けの最終音量調整、モバイル端末の確認は未実施。
- ローカル確認URL：`http://127.0.0.1:5100/asset-preview.html`。開発サーバー稼働中のみ有効。ESモジュールを使用するためHTTP経由で開く。
