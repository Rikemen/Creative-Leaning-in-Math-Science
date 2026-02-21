# JavaScript全般
 - JavaScript
   - varは禁止。letも極力やめて、constを使うようにする(immutable)
     - for(let ...) もfor ofやforEach, map, reduceを使えないか検討する
   - Array操作はfind, some, every, includesなどを使う
   - 型は必ずつける。any/unknownは使わない。
     - 「as」(type assertion)は極力使わない
     - 判別可能なユニオン型 (discriminated union)を活用する
   - Promise
     - 特別な場合を除き then, promiseではなくasync/await を使う
     - setTimeoutも、await sleep(src/utils/utils.ts)などを使う
   - hash値は使えるときは省略記法を使う
     - { hoge: hoge } ではなく { hoge }
   - 数値を直接ソースに書かない。定数（変数として定義する)
     - const sleepTimeSecond = 10; 
     - await sleep(sleepTimeSecond);
   - 変数名は、極力誰が読んでも意味がわかるように付ける
      - x, ではな くmodalBoxPositionX など
      - 単位などもつける sleep_time_ms
        - distance_to_home_km
      - 同じ変数名を違う意味で複数箇所で使わない
      - configではなく、userConfig/projectConfig
   - ifやforを深くnestさせない
   -  DRY(Don't repeat yourself)
   - 変更に強い実装を。 arrayは数が増えても動くか、順番が変わっても問題なく動作するか。
   - importはalias pathを使う（ファイルを移動したときに、相対パスだと壊れる）
     - from '@/hogehoge' 形式


# Firebase
 - dataのインスタンス化
   - firestoreからとったデータはmodelのインスタンスして(src/models/以下参照）使う
     - データをメソッドで操作することで、変更を一箇所にまとめられる
     - 型の定義も同時にする
 - onSnapshotのdetacherの処理を忘れずに。
 - v8ではなくv9以降のライブラリででかく
 
 # style
   - tailwind cssを使う
   - どうしても必要なとき以外は、styleタグには記述しない
     
# Git
   - rebaseは使わない
     - 　きれいにするのはコードであってcommit履歴ではない
   - forceは使わない
     - forceはジェダイ・マスターのみ。
   - こまめにcommitしてPRも読める量を素早く
     - 意味がある変更なら1行でもcommitする
     - commit履歴でどういう思考で変更したかがわかる
     - 大きなPRは読めない、見落とす
     - 小さなPRを早く回すにはレビューも素早く

     s
# format
  - commit前に yarn run formatを行う
    
