# Rikemen CH. Cozy 15-Second Ending Development Plan

| Loop | Task | User-facing summary | Unit test | Refactor checkpoint |
| --- | --- | --- | --- | --- |
| 1 | Scaffold ending page | オープニングと同じ操作感の15秒エンディング画面を用意します。 | DOM IDと900フレーム設定 | Openingを変更せず独立させる |
| 2 | Add ending timeline | 15秒の演出区間と境界をテストで固定します。 | 全区間の境界フレーム | 時刻計算を純粋関数化 |
| 3 | Define end-screen zones | 動画2枠と登録枠が重ならない配置を固定します。 | 矩形の範囲・重複検証 | 座標を設定データへ集約 |
| 4 | Build cozy notebook scene | 生成り紙と手描きモチーフで、ほのぼのした背景を作ります。 | 固定seedの飾り検証 | 背景レイヤーを分離 |
| 5 | Animate character peek-ins | 10人が画面の縁から優しく顔を出して見送ります。 | 座標・安全領域検証 | 補間と個別補正を分離 |
| 6 | Add message and postcards | お礼と次の動画を、手紙や写真カードのように見せます。 | 表示時刻・文言・領域検証 | テキストとカード描画を分離 |
| 7 | Add gentle acoustic jingle | 木琴とベルのような柔らかい電子音を付けます。 | 音量・終了時刻検証 | 音階とエンベロープを設定化 |
| 8 | Add playback and recording | 15秒再生、フレーム確認、WebM録画を追加します。 | 録画時間と形式選択 | 既存録画処理を再利用 |
| 9 | Verify visual integration | 代表フレームとYouTube配置ガイドを確認します。 | 全ユニットテスト | ガイド表示を本番描画から分離 |
| 10 | Document export workflow | MP4変換とYouTube Studio設定を説明します。 | コマンドと仕様値を検証 | 重複説明をREADMEへ集約 |

## Goal / scope

- `8_arts/rikemen-ending/` に、1920×1080・60fps・900フレーム（15秒）の独立したp5.js作品を追加する。
- Openingの濃紺・発光・速い軌道演出は使わず、生成り紙、淡い空色、桃色、若草色、柔らかい茶色を基調にした「学び終わりの放課後」を表現する。
- 背景は研究ノートを思わせる紙テクスチャとし、本、鉛筆、葉、星、フラスコ、音符などの手描き風doodleをp5.jsで添える。グリッド、宇宙、ネオン、数式の収束演出は使用しない。
- 10人全員を使用するが、5.5秒以降は画面の左右・下端から見守るように配置し、2〜3pxの呼吸・手振り程度に抑えてYouTubeのクリック領域を邪魔しない。
- 表示文言は上部中央に `見てくれてありがとう！`、その下に `また一緒に学ぼう`、下端中央に `Rikemen CH.` とする。
- 見出しには既存の `RampartOne-Regular.ttf`、補助文には `NotoSansJP-Regular.ttf` を使い、Openingの太いRobotoロゴとは違う手描き感と環境に依存しない日本語表示を両立する。
- 終了画面には、左「おすすめ」、右「つぎに見る」の16:9ポストカード風パネルと、中央下のチャンネル登録用丸型ステッカーを置く。
- WebM録画、H.264/AAC MP4変換、フレームスライダー、音付きリプレイをOpeningと同じ操作で提供する。
- Opening本体の演出や300フレーム設定は変更しない。汎用的な `../rikemen-opening/recorder.js` のみ読み込んで再利用する。

### 15秒の演出

| Time | Frames | Visual and sound |
| --- | ---: | --- |
| 0.0–1.5秒 | 0–89 | 生成り紙の背景が下からゆっくり現れ、淡い空色と桃色の丸い色面、紙の粒、葉がふわりと入る。 |
| 1.2–3.8秒 | 72–227 | 10人が左右と下端から時間差で小さくバウンドしながら顔を出し、外周の待機位置へ落ち着く。 |
| 2.4–4.2秒 | 144–251 | `見てくれてありがとう！` と `また一緒に学ぼう` が、手書き文字を書くように順に現れる。 |
| 3.6–5.5秒 | 216–329 | 左右のポストカードが机へ置かれるように少し傾いて現れ、登録ステッカーが一度だけ弾む。 |
| 5.5–13.5秒 | 330–809 | 完成画面を保持。葉・紙片・湯気だけが低速で動き、人物は2〜3pxの呼吸モーションにする。 |
| 13.5–14.4秒 | 810–863 | 木琴風ジングルと小さなベルを静かに収束させ、動きもさらに小さくする。 |
| 14.4–15.0秒 | 864–899 | 明るい完成画面をそのまま保持し、黒フェードせず動画末尾までクリック可能にする。 |

### YouTube element zones at 1920×1080

- Left video: `x=150, y=315, width=640, height=360`
- Right video: `x=1130, y=315, width=640, height=360`
- Subscribe: center `x=960, y=825`, diameter `180`
- Title band: `x=300–1620, y=85–245`
- 10人と装飾は上記3領域へ入れず、外周5%の安全領域にも収める。
- ポストカードは白〜生成りの紙、角丸、淡い影、マスキングテープ風の飾りで描く。YouTube要素が表示されない環境でも、写真を待つメッセージカードとして自然に見える状態にする。
- 登録ゾーンは赤いYouTube風ボタンを焼き込まず、若草色の丸い紙ステッカーと `チャンネル登録` の案内だけを背景に置き、実際の登録要素が重なっても読める余白を取る。

## Assumptions and risks

- 通常の16:9動画を対象とし、縦型Shorts版は含めない。
- YouTube公式仕様では終了画面は最後の5〜20秒に配置でき、16:9では最大4要素、対象動画は25秒以上必要なため、15秒尺に「動画2件＋登録1件」を重ねる前提とする。
- 「子ども向け」に設定された動画など、終了画面が表示されない環境でも成立するよう、背景だけでチャンネル名と感謝が伝わるデザインにする。
- YouTube側は端末や視聴状況により要素の表示方法を変える場合があるため、焼き込み枠へピクセル単位で合わせず、十分に広い余白を取る。
- 音は外部素材を使わずWeb Audio APIで生成する。木琴を思わせる短いtriangle波と丸いsine波を重ね、Cメジャー・ペンタトニックの `C5–E5–G5–A5–G5–E5–C5` で穏やかに帰着させる。
- Openingとの共通点はキャラクターと `Rikemen CH.` の名称、1080p/60fpsの品質だけに留め、暗色、ネオン、軌道、速い収束、強い発光はEndingへ持ち込まない。
- Openingと同様、音声付き自動再生・録画開始にはユーザー操作が必要になる。
- 参照仕様: [YouTube Help: Add end screens to videos](https://support.google.com/youtube/answer/6388789?hl=en)

## Detailed loops

### Loop 1: Scaffold ending page

- Objective: Openingと同じプレビューUIを持つEnding専用ページを作る。
- TDD test: `index.html` がCanvas、frame slider、replay、record、statusの必須IDを持ち、900フレーム表示になっていることを検証する。
- Minimal implementation: `index.html`、`styles.css`、空の `sketch.js`、テストディレクトリを追加する。CSSはEnding専用ファイルに閉じる。
- Unit test: `node --test 8_arts/rikemen-ending/test/dom-contract.test.cjs`
- Refactor checkpoint: Openingのファイルをコピー後に不要な5秒固有文言を除き、共通CSSへ影響させない。
- Completion criteria: ページがHTTPサーバーから開き、1920×1080 Canvasがレスポンシブに縮小表示される。

### Loop 2: Add ending timeline

- Objective: 15秒を決定的な900フレームとして扱う。
- TDD test: `FPS=60`、`TOTAL_FRAMES=900`、各演出境界、範囲外フレームの正規化を検証する。
- Minimal implementation: `timeline-utils.js` に `getEndingState(frame)` とイージング関数を追加する。
- Unit test: `node --test 8_arts/rikemen-ending/test/timeline-utils.test.cjs`
- Refactor checkpoint: ミリ秒やマジックナンバーを描画コードへ残さず、フレーム定数へ集約する。
- Completion criteria: 0、89、191、239、269、809、863、899の状態がテストで固定される。

### Loop 3: Define end-screen zones

- Objective: YouTube要素を重ねる3領域を安全に固定する。
- TDD test: 全領域がCanvas内、互いに非重複、外周5%内で、動画枠が16:9であることを検証する。
- Minimal implementation: `END_SCREEN_ZONES` と `intersects()` をtimeline utilityへ追加する。
- Unit test: `node --test 8_arts/rikemen-ending/test/layout-zones.test.cjs`
- Refactor checkpoint: 描画・テスト・デバッグガイドが同じ座標オブジェクトを参照する。
- Completion criteria: 左右動画2枠と登録円が単一設定から描画できる。

### Loop 4: Build cozy notebook scene

- Objective: Openingと明確に異なる、明るく温かい研究ノート風背景を作る。
- TDD test: 同じseedとフレームから同じ紙粒、葉、紙片の状態が返り、色定数に暗いネオン背景色が含まれないことを検証する。
- Minimal implementation: 生成り紙、淡い空色・桃色・若草色の丸い色面、紙の粒、本・鉛筆・葉・星・フラスコ・音符の手描きdoodleをレイヤー順に描く。
- Unit test: `node --test 8_arts/rikemen-ending/test/timeline-utils.test.cjs`
- Refactor checkpoint: 紙背景、色面、doodle、浮遊物を別関数にし、形と色を設定データへ集約する。
- Completion criteria: 0〜330フレームで背景が完成し、軌道線やネオンを使わずに学び・科学の雰囲気が伝わる。

### Loop 5: Animate character peek-ins

- Objective: 全10人が画面の縁から見送る、親しみのある集合画面にする。
- TDD test: 330〜899フレームの人物矩形が3つのYouTube領域と交差せず、座標・透明度が有限値であることを検証する。
- Minimal implementation: 原画10枚を読み込み、1.2〜3.8秒で左右・下端から少しオーバーシュートするease-out-backで登場させ、画像別の幅と透明余白を補正する。
- Unit test: `node --test 8_arts/rikemen-ending/test/character-layout.test.cjs`
- Refactor checkpoint: 人物別の幅・待機位置・回転は設定データへ置き、条件分岐を描画関数へ増やさない。
- Completion criteria: 全員が識別でき、動画枠・登録枠・タイトルと重ならず、5.5秒以降の移動量が3px以内になる。

### Loop 6: Add message and postcards

- Objective: 視聴完了への感謝と次の行動を明確にする。
- TDD test: タイトル、サブタイトル、動画枠、登録枠の表示進捗が指定フレームで0/1になることを検証する。
- Minimal implementation: `2_calculus/2_1_空間曲線の接線と法平面/assets/fonts/` 配下のRampart OneとNoto Sans JPを読み込み、日本語メッセージのstroke reveal、左右ポストカードの落下・小回転、丸型登録ステッカーの単発バウンド、下端ロゴを描く。
- Unit test: `node --test 8_arts/rikemen-ending/test/timeline-utils.test.cjs`
- Refactor checkpoint: テキスト、ポストカード、マスキングテープ、登録ステッカーを別関数にし、パステル色はCSS/JS双方で揃える。
- Completion criteria: 5.5秒時点で完成形となり、親しみやすい日本語と次の行動が15秒末尾まで読める。

### Loop 7: Add gentle acoustic jingle

- Objective: 木琴、ベル、小さなオルゴールを思わせる、ほのぼのしたジングルを作る。
- TDD test: 全cueが0〜14.4秒に収まり、gainが安全範囲内で、最終音がC系へ解決することを検証する。
- Minimal implementation: Cメジャー・ペンタトニックの短い木琴風フレーズ、5秒付近の柔らかい和音、8.5秒と12秒の小さなベル、13.5〜14.4秒の減衰をWeb Audio APIで生成する。
- Unit test: `node --test 8_arts/rikemen-ending/test/audio-engine.test.cjs`
- Refactor checkpoint: cue配列、音生成、録画用MediaStream出力を分離する。
- Completion criteria: クリッピングせず、Openingよりアタックと音量が弱く、14.4秒以降は無音になる。

### Loop 8: Add playback and recording

- Objective: 15秒の再生・静止確認・音声付き録画を提供する。
- TDD test: 録画時間が15000ms、VP9/Opus→VP8/Opusの順で選択されることを検証する。
- Minimal implementation: `../rikemen-opening/recorder.js` を読み込み、`window.RikemenEnding.replay({sound})`、`seek(frame)`、`record()`、`getFrame()` を公開する。
- Unit test: `node --test 8_arts/rikemen-ending/test/recorder-contract.test.cjs`
- Refactor checkpoint: Ending固有の15秒制御だけをsketchに置き、録画クラスは複製しない。
- Completion criteria: 2回続けて録画しても両方に音声が入り、UIは録画中に無効化される。

### Loop 9: Verify visual integration

- Objective: 代表フレームとYouTube要素の重なりを確認する。
- TDD test: 全テストをまとめて実行し、900フレーム中にNaNや領域交差がないことを走査する。
- Minimal implementation: プレビュー専用のガイド切替を追加し、0、89、150、239、269、540、809、863、899を確認する。ガイドは録画Canvasへ含めない。
- Unit test: `node --test 8_arts/rikemen-ending/test/*.test.cjs`
- Refactor checkpoint: デバッグDOMと本番Canvasを分離し、録画出力へUIを混入させない。
- Completion criteria: 1920×1080と縮小プレビューで文字・人物・枠が切れず、クリック領域が明確に空く。

### Loop 10: Document export workflow

- Objective: 動画化からYouTube Studio設定まで再現可能にする。
- TDD test: README内に15秒、60fps、H.264、AAC、YouTube要素3件の必須値が記載されていることを検証する。
- Minimal implementation: ローカル起動、WebM録画、FFmpeg変換、ffprobe確認、YouTube Studioでの左動画・右動画・登録配置をREADMEへ記載する。
- Unit test: `node --test 8_arts/rikemen-ending/test/docs-contract.test.cjs`
- Refactor checkpoint: コマンドを1か所に集約し、OpeningのREADMEを変更しない。
- Completion criteria: 別の作業者がREADMEだけで15秒MP4とYouTube終了画面を設定できる。

## Verification strategy

- Unit: timeline、領域交差、人物配置、seeded particle、audio cue、recorder、README contractをNode組み込みテストで検証する。
- Visual: ローカルHTTPサーバーから最新Chromeで開き、代表9フレームと15秒連続再生を確認する。生成り背景、パステル配色、ポストカード、日本語見出しがOpeningと一目で区別できることも確認する。
- Recording: WebMを2回連続録画し、双方が映像・Opus音声を持つことを `ffprobe` で確認する。
- Conversion: MP4を `-t 15 -r 60 -c:v libx264 -pix_fmt yuv420p -c:a aac` で変換し、15.000秒、1920×1080、60fps、H.264/AACを確認する。
- YouTube: 限定公開のテスト動画に左動画・右動画・登録の3要素を配置し、PC・YouTubeアプリで重なりとクリック可能時間を確認する。

## Rollback / follow-up

- Endingは新規ディレクトリに閉じるため、問題時はその追加だけを外せばOpeningへ影響しない。
- YouTube Studioで要素位置が合わない場合は、動画を再生成せずStudio側のドラッグ配置を優先する。背景パネル変更は実測後の別タスクにする。
- 将来9:16版が必要になった場合は、16:9座標の単純縮小ではなく、専用ゾーンと人物配置を持つ別タイムラインとして追加する。
