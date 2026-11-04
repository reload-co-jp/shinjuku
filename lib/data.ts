import placesJson from "@/data/places.json"
import contentsJson from "@/data/contents.json"
import sourcesJson from "@/data/sources.json"
import {
  jstDateString,
  Period,
  thisWeekPeriod,
  todayPeriod,
  upcomingDaysPeriod,
  weekendPeriod,
} from "./date"
import type { Locale } from "./i18n-config"
import { PLACE_TYPES } from "./types"
import type {
  Area,
  Category,
  Content,
  Place,
  PlaceType,
  Source,
  Theme,
} from "./types"

export const places = placesJson as Place[]
export const contents = contentsJson as Content[]
export const sources = sourcesJson as Source[]

export const getPlacesByType = (type: PlaceType): Place[] =>
  places.filter((place) => place.type === type)

// 掲載のある施設種別のみ(空ページを作らない)
export const placeTypes = (Object.keys(PLACE_TYPES) as PlaceType[]).filter(
  (type) => getPlacesByType(type).length > 0
)

// 翻訳版を追加する際の差し込み口。現在は日本語のみのため常にそのまま返す
export const isTranslated = (_content: Content, _locale: Locale): boolean =>
  true

export const localizeContent = (content: Content, _locale: Locale): Content =>
  content

export const localizePlace = (place: Place, _locale: Locale): Place => place

export const getPlace = (id: string): Place | undefined =>
  places.find((place) => place.id === id)

export const getContent = (id: number): Content | undefined =>
  contents.find((content) => content.id === id)

export const getSource = (id: string): Source | undefined =>
  sources.find((source) => source.id === id)

const sortByLatest = (items: Content[]): Content[] =>
  [...items].sort((a, b) => b.published_at.localeCompare(a.published_at))

export const getLatestContents = (limit?: number): Content[] => {
  const sorted = sortByLatest(contents)
  return limit ? sorted.slice(0, limit) : sorted
}

export const getContentsByCategory = (category: Category): Content[] =>
  sortByLatest(contents.filter((content) => content.category === category))

export const getContentsByArea = (area: Area): Content[] =>
  sortByLatest(contents.filter((content) => content.area === area))

export const getContentsByPlace = (placeId: string): Content[] =>
  sortByLatest(contents.filter((content) => content.place_id === placeId))

const isInPeriod = (content: Content, from: string, to: string): boolean => {
  if (!content.start_at) return false
  const start = content.start_at
  const end = content.end_at ?? content.start_at
  return start <= to && end >= from
}

const sortByStart = (items: Content[]): Content[] =>
  [...items].sort((a, b) => (a.start_at ?? "").localeCompare(b.start_at ?? ""))

// 開始が近い順。期間開始前から開催中のものは期間開始日扱いで先頭、その中は開始が新しい順
const sortBySoonest = (items: Content[], from: string): Content[] => {
  const key = (content: Content) =>
    (content.start_at ?? "") > from ? (content.start_at ?? "") : from
  return [...items].sort(
    (a, b) =>
      key(a).localeCompare(key(b)) ||
      (b.start_at ?? "").localeCompare(a.start_at ?? "")
  )
}

export const getEventsInPeriod = (from: string, to: string): Content[] =>
  sortBySoonest(
    contents.filter(
      (content) => content.type === "event" && isInPeriod(content, from, to)
    ),
    from
  )

const eventsIn = ({ from, to }: Period): Content[] =>
  getEventsInPeriod(from, to)

export const getTodayEvents = (now = new Date()): Content[] =>
  eventsIn(todayPeriod(now))

// 開催中または明日・明後日に開催のイベント
export const getUpcomingDaysEvents = (now = new Date()): Content[] =>
  eventsIn(upcomingDaysPeriod(now))

export const getThisWeekEvents = (now = new Date()): Content[] =>
  eventsIn(thisWeekPeriod(now))

export const getWeekendEvents = (now = new Date()): Content[] =>
  eventsIn(weekendPeriod(now))

// 今日以降に終了していない(開催中・開催予定の)イベント
export const getUpcomingEvents = (now = new Date()): Content[] =>
  eventsIn({ from: jstDateString(now), to: "9999-12-31" })

// 開催中・開催予定のイベントのうちテーマに該当するもの
export const getThemeEvents = (theme: Theme, now = new Date()): Content[] =>
  getUpcomingEvents(now).filter((content) => content.tags?.includes(theme))

export const getOngoingContentsByCategory = (
  category: Category,
  now = new Date()
): Content[] => {
  const date = jstDateString(now)
  return contents
    .filter(
      (content) =>
        content.category === category && isInPeriod(content, date, date)
    )
    .sort((a, b) => (a.end_at ?? "").localeCompare(b.end_at ?? ""))
}

export const isEnded = (content: Content, now = new Date()): boolean => {
  const end = content.end_at ?? content.start_at
  return end !== null && end < jstDateString(now)
}

// 施設ページ用: 開催中・今後・終了/ニュースに分類
export const getPlaceContents = (placeId: string, now = new Date()) => {
  const today = jstDateString(now)
  const items = contents.filter((content) => content.place_id === placeId)
  const events = items.filter((content) => content.start_at)
  return {
    ongoing: sortByStart(
      events.filter((content) => isInPeriod(content, today, today))
    ),
    upcoming: sortByStart(
      events.filter((content) => (content.start_at ?? "") > today)
    ),
    others: sortByLatest(
      items.filter((content) => !content.start_at || isEnded(content, now))
    ),
  }
}

export const getCategoryCount = (category: Category): number =>
  contents.filter((content) => content.category === category).length

// 記事詳細の関連コンテンツ。同じ施設 > 同じカテゴリ > 開催時期が近い の順でスコアリング
export const getRelatedContents = (target: Content, limit = 6): Content[] => {
  const dayDistance = (content: Content): number => {
    if (!content.start_at || !target.start_at) return Infinity
    return Math.abs(
      (Date.parse(content.start_at) - Date.parse(target.start_at)) / 86400000
    )
  }
  const score = (content: Content): number => {
    let value = 0
    if (target.place_id && content.place_id === target.place_id) value += 4
    if (content.category === target.category) value += 2
    if (dayDistance(content) <= 14) value += 1
    return value
  }
  return contents
    .filter((content) => content.id !== target.id)
    .map((content) => ({ content, score: score(content) }))
    .filter(({ score }) => score >= 2)
    .sort(
      (a, b) =>
        b.score - a.score ||
        dayDistance(a.content) - dayDistance(b.content) ||
        b.content.published_at.localeCompare(a.content.published_at)
    )
    .slice(0, limit)
    .map(({ content }) => content)
}

// 月別アーカイブ。薄いページを作らないためイベント数がしきい値以上の月のみ
export const ARCHIVE_MIN_EVENTS = 10

const monthEnd = (year: string, month: string): string =>
  new Date(Date.UTC(Number(year), Number(month), 0)).toISOString().slice(0, 10)

export const getMonthEvents = (year: string, month: string): Content[] =>
  getEventsInPeriod(`${year}-${month}-01`, monthEnd(year, month))

export const getArchiveMonths = (): { year: string; month: string }[] => {
  const months = new Set<string>()
  for (const content of contents) {
    if (content.type !== "event" || !content.start_at) continue
    const end = content.end_at ?? content.start_at
    let cursor = `${content.start_at.slice(0, 7)}-01`
    while (cursor <= end) {
      months.add(cursor.slice(0, 7))
      const [year, month] = cursor.split("-").map(Number)
      cursor = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
    }
  }
  return [...months]
    .sort()
    .map((key) => {
      const [year, month] = key.split("-")
      return { year, month }
    })
    .filter(
      ({ year, month }) =>
        getMonthEvents(year, month).length >= ARCHIVE_MIN_EVENTS
    )
}
