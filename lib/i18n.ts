import {
  Area,
  AREAS,
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_TITLES,
  Category,
  PLACE_TYPES,
  PlaceType,
  Theme,
} from "./types"
import { Locale } from "./i18n-config"

export * from "./i18n-config"

// 現在は日本語のみ
export const getLocale = async (): Promise<Locale> => "ja"

const ja = {
  siteName: "新宿ライブ",
  siteDescription:
    "新宿エリアのイベント・新店舗・閉店・セール・POP UP・公演・展示・地域ニュースを届ける新宿地域メディア",
  nav: {
    latest: "最新情報",
    events: "イベント",
    today: "今日",
    thisWeek: "今週",
    weekend: "今週末",
    nextWeek: "来週",
    thisMonth: "今月",
    festival: "祭り・季節行事",
    performance: "公演・ステージ",
    theater: "演劇",
    concert: "ライブ",
    newOpening: "新店舗",
    closing: "閉店",
    sale: "セール",
    popup: "POP UP",
    collab: "コラボ",
    exhibition: "展示・アート",
    illumination: "イルミネーション",
    places: "施設",
    spots: "スポット",
    areas: "エリア",
    news: "ニュース",
    guide: "紹介記事",
  },
  breadcrumbLabel: "パンくずリスト",
  home: {
    title:
      "新宿のイベント情報【毎日更新】今日・今週末の予定と新店舗・地域ニュース｜新宿ライブ",
    description:
      "新宿で今日・今週末・今月に開催されるイベントを毎日更新。新宿御苑・花園神社の行事、歌舞伎町・西新宿の劇場公演やライブ、百貨店のPOP UP・セール、イルミネーション、新店舗・地域ニュースまで新宿の今がわかる地域メディア。",
    heading: "新宿のイベント・公演・POP UP・新店舗・地域ニュース",
    today: "今日の新宿",
    thisWeek: "今週の新宿",
    weekend: "今週末の新宿イベント",
    newOpening: "新宿の新店舗",
    sale: "現在開催中のセール",
    latest: "新宿の最新情報",
    places: "施設から探す",
    areas: "エリアから探す",
    hero: "新宿の今を、つかまえる。",
    todayLead: "新宿で、今日なにする？",
    featured: "注目記事",
    weekendLead: "週末に出かけたい、写真で選ぶイベント",
    newOpeningLead: "新しくオープンした店舗・施設",
    latestLead: "街の動きを新着順で",
    byCategory: "カテゴリーから読む",
    viewAll: "すべて見る",
  },
  search: {
    label: "サイト内検索",
    placeholder: "記事を検索",
    submit: "検索",
    title: "検索結果",
    count: "{n}件",
    empty: "該当する記事はありません。",
  },
  interstitial: { label: "広告", close: "閉じる", top: "トップへ" },
  footer: {
    about: "サイトについて",
    aboutText:
      "新宿ライブ（SHINJUKU JOURNAL）は、新宿エリアのイベント・公演・POP UP・新店舗・地域ニュースを毎日更新で届ける地域メディアです。",
    operator: "運営者",
    operatorName: "株式会社リロード",
    contact: "お問い合わせ",
    contactText: "運営会社サイトよりご連絡ください",
  },
  carousel: {
    label: "開催中・近日開催のイベント",
    ongoing: "開催中",
    tomorrow: "明日から",
    dayAfter: "明後日から",
    today: "本日開催",
    endsToday: "本日まで",
    endsTomorrow: "明日まで",
    daysLeft: (days: number) => `あと${days}日`,
  },
  card: {
    held: (period: string) => `開催 ${period}`,
    published: (date: string) => `公開 ${date}`,
    empty: "現在情報はありません。",
  },
  imageAlt: (place: string, title: string) => `${place}の${title}`,
  themes: {
    free: {
      label: "無料イベント",
      title: "新宿の無料イベント・入場無料の催し",
      description:
        "新宿で開催中・開催予定の入場無料・参加無料のイベントをまとめています。イルミネーション・展示・マルシェ・地域の祭りなど、お金をかけずに新宿を楽しめる催しを開催日順に掲載。",
    },
    kids: {
      label: "子連れ・親子",
      title: "新宿の子連れ・親子で楽しめるイベント",
      description:
        "新宿で開催中・開催予定の子ども向け・親子向けイベントをまとめています。公園や商業施設のキッズ企画、体験・ワークショップなど、家族で楽しめる催しを開催日順に掲載。",
    },
    workshop: {
      label: "体験・ワークショップ",
      title: "新宿の体験・ワークショップイベント",
      description:
        "新宿で開催中・開催予定の体験イベント・ワークショップをまとめています。ものづくりや文化体験など、参加して楽しめる催しを開催日順に掲載。",
    },
    night: {
      label: "夜・ライトアップ",
      title: "夜の新宿イベント・イルミネーション情報",
      description:
        "新宿で開催中・開催予定の夜のイベント・イルミネーション・ライトアップ・夜公演をまとめています。新宿の夜の楽しみ方を開催日順に掲載。",
    },
  } satisfies Record<
    Theme,
    { label: string; title: string; description: string }
  >,
  hub: {
    byPeriod: "期間から探す",
    byGenre: "ジャンルから探す",
    byTheme: "テーマから探す",
    periodTitle: (label: string, period: string) =>
      `${label}の新宿イベント｜${period}`,
    periodMetaTitle: (label: string) =>
      `${label}の新宿イベント情報【毎日更新】`,
    thisMonthTitle: (month: string) => `${month}の新宿イベント・公演・展示`,
    periodDescription: (period: string) =>
      `${period}に新宿で開催されるイベント・公演・ライブ・展示・POP UP・イルミネーション情報を一覧でまとめています。新宿御苑・新宿高島屋・新宿マルイなど施設別の開催情報も掲載。`,
    periodLead: (period: string, count: number, updated: string) =>
      `${period}に新宿で開催中・開催予定のイベント ${count}件（${updated}更新）`,
  },
  events: {
    title:
      "新宿のイベント情報｜公演・ライブ・展示・POP UP・イルミネーション｜新宿ライブ",
    description:
      "新宿で開催中・開催予定のイベントを開催日順に掲載。歌舞伎町・西新宿の劇場公演やライブ、美術館の展覧会、百貨店のPOP UP、イルミネーション、新宿御苑・花園神社の行事まで、今日・今週末・今月の予定から探せます。",
    heading: "新宿のイベント情報",
    lead: (count: number) => `新宿で開催中・開催予定のイベント ${count}件`,
    archive: "月別アーカイブ",
    schedule: "開催スケジュール",
    upcoming: "開催中・開催予定のイベント一覧",
    monthTitle: (month: string) =>
      `${month}の新宿イベント・公演・展示一覧｜新宿ライブ`,
    monthDescription: (month: string, count: number) =>
      `${month}に新宿で開催された・開催されるイベント${count}件の一覧。公演・ライブ、展示、POP UP、祭り・季節行事などの開催日・会場をまとめています。`,
    monthHeading: (month: string) => `${month}の新宿イベント`,
    monthLead: (month: string, count: number) =>
      `${month}に新宿で開催のイベント ${count}件`,
  },
  category: {
    description: (base: string, count: number) =>
      `${base}。掲載${count}件を開催日・公開日順に紹介。`,
  },
  content: {
    ended: "開催終了",
    published: (date: string) => `${date} 公開`,
    period: "開催期間",
    place: "場所",
    address: "住所",
    source: "情報源",
    placeLink: (place: string) => `${place}のイベント・施設情報を見る →`,
    categoryLink: (category: string) => `新宿の${category}情報一覧 →`,
    official: "公式情報を見る →",
    related: "関連する新宿の情報",
  },
  place: {
    listTitle:
      "新宿の施設・スポット情報｜百貨店・劇場・美術館・公園｜新宿ライブ",
    listDescription: (count: number) =>
      `新宿高島屋・伊勢丹新宿店などの百貨店、新宿ミロード・ルミネなどの商業施設、紀伊國屋ホールなどの劇場、SOMPO美術館などの美術館、新宿御苑・花園神社まで、新宿の施設${count}件の基本情報と開催中・今後のイベントをまとめています。`,
    listHeading: "新宿の施設・スポット",
    listLead: "施設ごとに開催中・今後のイベントや関連ニュースを掲載",
    typeTitle: (type: string) => `新宿の${type}一覧`,
    typeDescription: (type: string, count: number) =>
      `新宿エリアの${type}${count}件の基本情報と開催中・今後のイベントをまとめています。`,
    more: (type: string) => `${type}をすべて見る`,
    eventCount: (count: number) => `開催中・今後のイベント ${count}件`,
    title: (name: string, type: string, area: string) =>
      `${name}のイベント・最新情報｜${type}・${area}｜新宿ライブ`,
    descriptionSuffix: (count: number) =>
      ` 開催中・今後のイベント${count}件を掲載。`,
    imageAlt: (name: string) => `${name}の外観`,
    address: "住所",
    hours: "営業時間",
    updated: "情報更新日",
    map: (name: string) => `${name}の地図`,
    googleMaps: "Googleマップで開く →",
    phone: "電話",
    official: "公式サイト →",
    ongoing: (name: string) => `${name}で開催中のイベント`,
    upcoming: (name: string) => `${name}の今後のイベント`,
    others: (name: string) => `${name}の関連ニュース・過去のイベント`,
    otherPlaces: "新宿のほかの施設",
  },
  categories: CATEGORIES as Record<Category, string>,
  categoryTitles: CATEGORY_TITLES,
  categoryDescriptions: CATEGORY_DESCRIPTIONS,
  placeTypes: PLACE_TYPES as Record<PlaceType, string>,
  areas: AREAS as Record<Area, string>,
  area: {
    title: (area: string) => `${area}のイベント・新店舗・地域ニュース`,
    description: (area: string, count: number) =>
      `${area}エリアのイベント・新店舗・地域ニュースなど${count}件を公開日順に掲載。`,
    link: (area: string) => `${area}エリアの情報一覧 →`,
    listTitle: "エリアから探す｜新宿周辺のイベント・新店舗・ニュース",
    listHeading: "エリアから探す",
    listDescription:
      "新宿駅周辺・西新宿・歌舞伎町・新宿三丁目・新大久保・高田馬場・神楽坂など新宿区のエリア別に、イベント・新店舗・地域ニュースをまとめています。",
  },
}

type Dictionary = typeof ja

export const DICTIONARIES: Record<Locale, Dictionary> = { ja }

export const getDictionary = async () => {
  const locale = await getLocale()
  return { locale, t: DICTIONARIES[locale] }
}
