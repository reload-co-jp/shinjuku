import { MetadataRoute } from "next"
import {
  contents,
  getArchiveMonths,
  getContentsByArea,
  getContentsByCategory,
  getContentsByPlace,
  getLatestContents,
  getPlacesByType,
  getThemeEvents,
  places,
  placeTypes,
} from "@/lib/data"
import { SITE_URL } from "@/lib/json-ld"
import {
  AREAS,
  Area,
  CATEGORIES,
  Category,
  Place,
  Theme,
  THEMES,
} from "@/lib/types"

export const dynamic = "force-static"

// 日付ページはビルド毎に内容が変わるため、ビルド時刻をlastModifiedに使う
const buildTime = new Date().toISOString()

// 一覧ページは掲載記事の最新公開日をlastModifiedにする(記事0件はnoindexのため除外)
// changeFrequency/priority はGoogleが無視するため付けない
const listPage = (url: string, items: { published_at: string }[]) =>
  items.length > 0 ? [{ url, lastModified: items[0].published_at }] : []

type Page = { url: string; lastModified?: string }

// 場所一覧は掲載場所の情報更新日の最新をlastModifiedにする
const latestUpdate = (items: Place[]) =>
  items
    .map((place) => place.updated_at)
    .sort()
    .at(-1)

const pages = (): Page[] => [
  ...[
    "/",
    "/events/",
    "/today/",
    "/this-week/",
    "/weekend/",
    "/next-week/",
    "/this-month/",
  ].map((url) => ({ url, lastModified: buildTime })),
  ...(Object.keys(THEMES) as Theme[])
    .filter((theme) => getThemeEvents(theme).length > 0)
    .map((theme) => ({ url: `/theme/${theme}/`, lastModified: buildTime })),
  ...getArchiveMonths().map(({ year, month }) => ({
    url: `/events/${year}/${month}/`,
  })),
  ...(Object.keys(CATEGORIES) as Category[]).flatMap((category) =>
    listPage(`/category/${category}/`, getContentsByCategory(category))
  ),
  ...listPage("/area/", getLatestContents()),
  ...(Object.keys(AREAS) as Area[]).flatMap((area) =>
    listPage(`/area/${area}/`, getContentsByArea(area))
  ),
  { url: "/place/", lastModified: latestUpdate(places) },
  ...placeTypes.map((type) => ({
    url: `/place/type/${type}/`,
    lastModified: latestUpdate(getPlacesByType(type)),
  })),
  ...places.map((place) => ({
    url: `/place/${place.id}/`,
    // 記事公開日(YYYY-MM-DDTHH:mm…)と情報更新日(YYYY-MM-DD)の新しい方
    lastModified: [
      getContentsByPlace(place.id)[0]?.published_at,
      place.updated_at,
    ]
      .filter((date) => date != null)
      .sort()
      .at(-1),
  })),
  ...contents.map((content) => ({
    url: `/content/${content.id}/`,
    lastModified: content.published_at,
  })),
]

const sitemap = (): MetadataRoute.Sitemap =>
  pages().map((page) => ({ ...page, url: `${SITE_URL}${page.url}` }))

export default sitemap
