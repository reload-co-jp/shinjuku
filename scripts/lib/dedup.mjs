// 既存記事との重複判定。生成AIの言い回しが取得のたびに揺れるため、完全一致ではなく
// タイトルの類似度・包含関係・開催日で同一記事を見つける
import { parseTags } from "./taxonomy.mjs"

// 空白・括弧・記号は表記揺れとして無視する
export const normalizeTitle = (title) =>
  title
    .normalize("NFKC")
    .replace(/[\s\p{P}\p{S}]/gu, "")
    .toLowerCase()

// 同一ソース内の閾値
export const DUP_TITLE_SIM_THRESHOLD = 0.5
// ソース横断は「〇〇がオープン」等の短い定型タイトル同士が0.5を超えるため厳しめにする
export const DUP_TITLE_SIM_THRESHOLD_CROSS_SOURCE = 0.6

const bigrams = (s) => {
  const set = new Set()
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
  return set
}

// タイトルのbigram類似度(Dice係数、0〜1)
export const titleSimilarity = (a, b) => {
  const A = bigrams(normalizeTitle(a))
  const B = bigrams(normalizeTitle(b))
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const x of A) if (B.has(x)) inter++
  return (inter * 2) / (A.size + B.size)
}

// 一方のタイトルが他方を含む場合(施設名等の前置きの有無)も同一記事とみなす
export const titleContains = (a, b) => {
  const A = normalizeTitle(a)
  const B = normalizeTitle(b)
  return Math.min(A.length, B.length) >= 6 && (A.includes(B) || B.includes(A))
}

// 「11月の〜」「12月の〜」のように月だけ異なる定期告知は別記事とみなす
const monthsOf = (title) =>
  (title.normalize("NFKC").match(/\d+月/g) ?? []).sort().join(",")
const monthsConflict = (a, b) => {
  const A = monthsOf(a)
  const B = monthsOf(b)
  return A !== "" && B !== "" && A !== B
}

// 同一ソース、または同一カテゴリの記事から最も類似するものを返す。開催日が両方あって異なれば別記事
export const findDuplicate = (existing, candidate, sourceId) => {
  let best = null
  let bestScore = 0
  for (const c of existing) {
    if (c.source_id !== sourceId && c.category !== candidate.category) continue
    if (candidate.start_at && c.start_at && candidate.start_at !== c.start_at)
      continue
    if (monthsConflict(c.title, candidate.title)) continue
    const score = titleContains(c.title, candidate.title)
      ? 1
      : titleSimilarity(c.title, candidate.title)
    const threshold =
      c.source_id === sourceId
        ? DUP_TITLE_SIM_THRESHOLD
        : DUP_TITLE_SIM_THRESHOLD_CROSS_SOURCE
    if (score >= threshold && score > bestScore) {
      best = c
      bestScore = score
    }
  }
  return best
}

// 重複を検出したら破棄せず既存記事を補強する。変更があればtrue
// - 出典URLは既存と異なればsource_urlsに追記(既存が一覧URLで今回個別URLなら差し替え)
// - 本文は情報量の多い(長い)方を採用
// - タグは和集合、開催日は既存に欠けていれば補う
export const mergeIntoExisting = (existing, candidate, pageUrl, listingUrl) => {
  let changed = false

  const knownUrls = new Set(
    [existing.source_url, ...(existing.source_urls ?? [])].filter(Boolean)
  )
  if (existing.source_url === listingUrl && pageUrl !== listingUrl) {
    existing.source_url = pageUrl
    changed = true
  } else if (!knownUrls.has(pageUrl)) {
    existing.source_urls = [...(existing.source_urls ?? []), pageUrl]
    changed = true
  }

  const candidateBody = candidate.body ?? candidate.summary ?? ""
  if (candidateBody.length > (existing.body?.length ?? 0)) {
    existing.summary = candidate.summary ?? existing.summary
    existing.body = candidateBody
    changed = true
  }

  const tags = parseTags([...(existing.tags ?? []), ...(candidate.tags ?? [])])
  if (tags.length !== (existing.tags ?? []).length) {
    existing.tags = tags
    changed = true
  }
  if (candidate.start_at && !existing.start_at) {
    existing.start_at = candidate.start_at
    changed = true
  }
  if (candidate.end_at && !existing.end_at) {
    existing.end_at = candidate.end_at
    changed = true
  }
  return changed
}

// 施設名から places.json のIDを引く(完全一致優先、次に部分一致)
export const findPlaceId = (places, placeName) => {
  const name = placeName?.trim()
  if (!name) return null
  const exact = places.find((p) => p.name === name)
  if (exact) return exact.id
  const partial = places.find(
    (p) => name.includes(p.name) || p.name.includes(name)
  )
  return partial ? partial.id : null
}
