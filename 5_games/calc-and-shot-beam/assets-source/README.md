# 素材の制作元

- `images/`：背景、ヒーロー、腕などの生成元・編集元。
- `audio/`：効果音の編集元や合成レシピ。
- `prompts/`：採用素材の生成プロンプトと版の記録。

ここはHosting配信対象外。本番用に採用した画像・音は `../public/assets/` へ書き出す。合意済みUI参考画像は `../system-design/dev-plans/reference-assets/` に維持する。

素材の出典、用途、利用条件、書き出し先は `../docs/asset-manifest.md` へ記録する。

Loop 16以降は [素材仕様](../docs/asset-spec.md) の共通座標・命名・予定プロンプトを使用する。制作元は `images/<id>/<revision>/`、実行した指示は `prompts/<id>-<revision>.json` に記録する。既存v1を保存し、次は未使用のv2以降で管理する。
