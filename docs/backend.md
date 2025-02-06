| パラメーター      | 型       | 説明              |
|-------------------|----------|-------------------|
| id              | int      | ID         |
| time            | int      | タイム   |
| scramble        | string   | スクランブル |
| created_at      | datetime | データ作成日時    |
| note            | string   | メモ             | 
| status 　　　    | string 　| ステータス(ok,+2,DNF)　　　|

<br>

# ソルブ詳細取得
【GET】/solves/{id}

# ソルブ作成
【POST】/solves

# ソルブ詳細変更
【PUT】/solves/{id}

# ソルブ削除
【DELETE】/solves/{id}

# スクランブル生成
generate_scramble()

# スクランブル描画