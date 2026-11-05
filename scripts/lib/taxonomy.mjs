// 記事取得スクリプト用の分類定義。lib/types.ts の CATEGORIES / AREAS / THEMES と同じキーを持つ
// (scripts/lib/taxonomy.test.ts で一致を検査している)

export const CATEGORIES = [
  "event",
  "festival",
  "performance",
  "theater",
  "concert",
  "new_opening",
  "closing",
  "renewal",
  "sale",
  "campaign",
  "popup",
  "collab",
  "new_product",
  "exhibition",
  "illumination",
  "facility_news",
  "local_news",
  "guide",
]

// 抽出プロンプトで説明するエリアの範囲
export const AREAS = {
  shinjuku:
    "新宿駅周辺(東口・西口・南口・新南口・新宿四丁目・新宿駅直結の駅ビル)",
  nishishinjuku:
    "西新宿(都庁・新宿中央公園・高層ビル街・西新宿五丁目・初台寄り)",
  kabukicho: "歌舞伎町(大久保公園・東急歌舞伎町タワー・西武新宿駅周辺)",
  sanchome:
    "新宿三丁目(伊勢丹・マルイ・紀伊國屋・花園神社・ゴールデン街・新宿二丁目・末廣亭)",
  gyoen: "新宿御苑(新宿御苑前・四谷四丁目・大木戸)",
  shinokubo: "新大久保(大久保・百人町・東新宿)",
  takadanobaba: "高田馬場(早稲田・西早稲田)",
  yotsuya: "四谷(四谷三丁目・荒木町・信濃町)",
  kagurazaka: "神楽坂(飯田橋・牛込・市ヶ谷の新宿区側)",
}

export const DEFAULT_AREA = "shinjuku"

export const THEMES = {
  free: "入場・参加・観覧が無料(無料登録・割引・一部のみ無料などは除く)",
  kids: "子ども・親子・家族向けの内容がある(子供料金の設定があるだけの場合は除く)",
  workshop:
    "参加者が自分の手で作る・体験するワークショップや体験企画がある(展示や公演を見るだけ、抽選・物販、運動レッスンは除く)",
  night:
    "夜(おおむね17時以降)の開催・夜の部・ライトアップ・イルミネーション・夜景が主な見どころの一つ(夜まで営業しているだけは除く)",
}

export const THEME_RULE = `- tagsは次の条件に明確に当てはまるものだけを配列で選ぶ(該当なしは[]): ${Object.entries(
  THEMES
)
  .map(([key, desc]) => `${key}=${desc}`)
  .join("、")}`

export const parseTags = (tags) =>
  Array.isArray(tags)
    ? [...new Set(tags)].filter((tag) => Object.hasOwn(THEMES, tag))
    : []
