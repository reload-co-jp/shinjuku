export const CATEGORIES = {
  event: "イベント",
  festival: "祭り・季節行事",
  performance: "公演・ステージ",
  theater: "演劇",
  concert: "コンサート・ライブ",
  new_opening: "新規オープン",
  closing: "閉店",
  renewal: "リニューアル",
  sale: "セール",
  campaign: "キャンペーン",
  popup: "POP UP",
  collab: "コラボ",
  new_product: "新商品",
  exhibition: "展示会",
  illumination: "イルミネーション",
  facility_news: "施設ニュース",
  local_news: "地域ニュース",
  guide: "紹介記事",
} as const

export type Category = keyof typeof CATEGORIES

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  event: "新宿エリアで開催されるイベント情報をまとめてお届け",
  festival: "新宿の祭り・季節行事の開催情報をまとめてお届け",
  performance: "新宿の公演・ステージ情報をまとめてお届け",
  theater: "新宿の劇場で上演される演劇・舞台公演情報をまとめてお届け",
  concert: "新宿エリアのコンサート・ライブ情報をまとめてお届け",
  new_opening: "新宿エリアの新規オープン店舗・施設情報をまとめてお届け",
  closing: "新宿エリアの閉店・営業終了情報をまとめてお届け",
  renewal: "新宿エリアのリニューアル情報をまとめてお届け",
  sale: "新宿の百貨店・商業施設で開催中のセール情報をまとめてお届け",
  campaign: "新宿エリアのキャンペーン情報をまとめてお届け",
  popup: "新宿エリアのPOP UPストア・期間限定ショップ情報をまとめてお届け",
  collab: "新宿エリアのコラボカフェ・コラボイベント情報をまとめてお届け",
  new_product: "新宿エリアの新商品・限定商品情報をまとめてお届け",
  exhibition: "新宿の美術館・ギャラリー・展示会情報をまとめてお届け",
  illumination: "新宿のイルミネーション・ライトアップ情報をまとめてお届け",
  facility_news: "新宿エリアの施設ニュースをまとめてお届け",
  local_news: "新宿区・新宿駅周辺の地域ニュースをまとめてお届け",
  guide: "新宿のエリア・通り・スポットの紹介記事をまとめてお届け",
}

// カテゴリページのtitle/H1。検索意図(例: 新宿 イベント 今週末)に合わせる
export const CATEGORY_TITLES: Record<Category, string> = {
  event: "新宿のイベント・体験情報",
  festival: "新宿の祭り・季節行事",
  performance: "新宿の公演・ステージ情報",
  theater: "新宿の演劇・舞台公演情報",
  concert: "新宿のコンサート・ライブ情報",
  new_opening: "新宿の新店舗・新規オープン情報",
  closing: "新宿の閉店・営業終了情報",
  renewal: "新宿のリニューアル情報",
  sale: "新宿のセール・バーゲン情報",
  campaign: "新宿のキャンペーン情報",
  popup: "新宿のPOP UP・期間限定ショップ情報",
  collab: "新宿のコラボカフェ・コラボイベント情報",
  new_product: "新宿の新商品・限定商品情報",
  exhibition: "新宿の展示・展覧会・美術館情報",
  illumination: "新宿のイルミネーション・ライトアップ情報",
  facility_news: "新宿の施設ニュース",
  local_news: "新宿の地域ニュース",
  guide: "新宿の紹介記事・エリアガイド",
}

// パンくずで「イベント」配下に置くカテゴリ
export const EVENT_CATEGORIES: Category[] = [
  "event",
  "festival",
  "performance",
  "theater",
  "concert",
  "exhibition",
  "popup",
  "collab",
  "illumination",
]

// 記事のエリアタグ。新宿駅東口・南口・新宿四丁目などは「新宿駅周辺」に含める
export const AREAS = {
  shinjuku: "新宿駅周辺",
  nishishinjuku: "西新宿",
  kabukicho: "歌舞伎町",
  sanchome: "新宿三丁目",
  gyoen: "新宿御苑",
  shinokubo: "新大久保",
  takadanobaba: "高田馬場",
  yotsuya: "四谷",
  kagurazaka: "神楽坂",
} as const

export type Area = keyof typeof AREAS

// 検索ニーズ別のテーマページ(例: 新宿 無料 イベント)。記事の tags で判定
export const THEMES = {
  free: "無料イベント",
  kids: "子連れ・親子",
  workshop: "体験・ワークショップ",
  night: "夜・ライトアップ",
} as const

export type Theme = keyof typeof THEMES

export const PLACE_TYPES = {
  department_store: "百貨店",
  facility: "商業施設",
  store: "店舗",
  theater: "劇場・ホール",
  live_house: "ライブハウス",
  cinema: "映画館",
  museum: "美術館・博物館",
  park: "公園・庭園",
  shrine: "神社",
  temple: "寺院",
  public_facility: "公共施設",
  tourist_spot: "観光スポット",
  restaurant: "飲食店",
  other: "その他",
} as const

export type PlaceType = keyof typeof PLACE_TYPES

export type Place = {
  id: string
  name: string
  type: PlaceType
  description: string
  address: string
  latitude: number | null
  longitude: number | null
  opening_hours: string | null
  phone: string | null
  url: string | null
  image_url: string | null
  // 表示用の街区名(例: 新宿三丁目、西新宿)
  area: string
  source_id: string | null
  source_url: string | null
  // 掲載情報(住所・営業時間等)を最後に確認した日(YYYY-MM-DD)
  updated_at: string
}

export type ContentType = "event" | "news"

export type Content = {
  id: number
  type: ContentType
  title: string
  summary: string
  // Markdown
  body: string
  category: Category
  area: Area
  // テーマページ(/theme/〇〇/)用のタグ
  tags?: Theme[]
  published_at: string
  start_at: string | null
  end_at: string | null
  place_id: string | null
  source_id: string | null
  source_url: string | null
  // source_url以外の出典URL一覧
  source_urls?: string[]
  image_url: string | null
}

export type SourceType =
  | "government"
  | "official"
  | "press_release"
  | "event_platform"
  | "gourmet_site"
  | "sns"
  | "web_media"

export type Source = {
  id: string
  name: string
  url: string
  source_type: SourceType
  priority: number
  // false: 記事の出典としてのみ使い、scripts/fetch-contents.mjs の巡回対象にしない(トップページ等)
  crawl?: boolean
}
