// data/sources.json の情報源を巡回し、Claude Code CLI(headless)でイベント・ニュースを抽出して
// data/contents.json に新規追加する。浅草ライブの scripts/fetch-contents.mjs を新宿向けに移植したもの
//
// 使い方:
//   pnpm fetch-contents                       全情報源(crawl: false を除く)
//   pnpm fetch-contents --source=kanko-shinjuku  指定した情報源のみ(カンマ区切りで複数可)
//   pnpm fetch-contents --dry-run             ファイルを書き換えず結果だけ表示
//   pnpm fetch-contents --limit=10            巡回する情報源の数を制限
//
// 認証は CLAUDE_CODE_OAUTH_TOKEN または ANTHROPIC_API_KEY を claude CLI が自動解決する
import { execFile } from "child_process"
import { mkdirSync, readFileSync, writeFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as cheerio from "cheerio"
import { findDuplicate, findPlaceId, mergeIntoExisting } from "./lib/dedup.mjs"
import {
  downloadImage,
  extractImgCandidates,
  extractMetaImage,
  guessExt,
  UA,
} from "./lib/images.mjs"
import {
  AREAS,
  CATEGORIES,
  DEFAULT_AREA,
  parseTags,
  THEME_RULE,
  THEMES,
} from "./lib/taxonomy.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const sourcesPath = path.join(root, "data/sources.json")
const placesPath = path.join(root, "data/places.json")
const contentsPath = path.join(root, "data/contents.json")
const imagesOutDir = path.join(root, "public/images/contents")

const MAX_TEXT_LENGTH = 15000
const FETCH_TIMEOUT_MS = 15000
const CLAUDE_TIMEOUT_MS = 240000
const SOURCE_INTERVAL_MS = 3000
const RETRY_DELAYS_MS = [10000, 30000, 60000]
const MAX_IMAGE_CANDIDATES = 20
const MAX_LINK_CANDIDATES = 100
// 1情報源あたりに開く個別ページの上限
const MAX_DETAIL_PAGES = 20
const MODEL = process.env.ANTHROPIC_MODEL || "sonnet"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const args = process.argv.slice(2)
const argValue = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null
const dryRun = args.includes("--dry-run")
const onlySourceIds = argValue("source")?.split(",").filter(Boolean) ?? null
const sourceLimit = Number(argValue("limit")) || Infinity

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf-8"))
const writeJson = (filePath, data) =>
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n")

// GitHub Actions(UTC)でも日本時間の日付にする
const jstToday = () =>
  new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

const isDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)

const fetchHtml = async (url) => {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": UA, "Accept-Language": "ja" },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

// RSSフィードを一覧ページ相当のHTMLに変換する(以降の抽出処理を共通化するため)
const rssToHtml = (xml) => {
  const $ = cheerio.load(xml, { xml: true })
  const items = $("item")
    .map((_, el) => {
      const item = $(el)
      const a = $("<a>").attr("href", item.find("link").text().trim())
      a.text(item.find("title").text())
      return `<p>${$.html(a)} ${item.find("pubDate").text()}</p>`
    })
    .get()
  return `<html><body>${items.join("\n")}</body></html>`
}

// Google ニュースの記事リンク(news.google.com/rss/articles/...)を元記事URLに変換する。失敗時はnull
const resolveGoogleNewsUrl = async (url) => {
  const id = new URL(url).pathname.split("/").pop()
  try {
    const html = await fetchHtml(url)
    const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1]
    const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1]
    if (!sg || !ts) return null
    // Google ニュースの記事ページが内部で使うURL解決API(garturlreq)の呼び出し形式
    const inner = JSON.stringify([
      "garturlreq",
      [
        [
          "X",
          "X",
          ["X", "X"],
          null,
          null,
          1,
          1,
          "US:en",
          null,
          1,
          null,
          null,
          null,
          null,
          null,
          0,
          1,
        ],
        "X",
        "X",
        1,
        [1, 1, 1],
        1,
        1,
        null,
        0,
        0,
        null,
        0,
      ],
      id,
      Number(ts),
      sg,
    ])
    const res = await fetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": UA,
        },
        body: new URLSearchParams({
          "f.req": JSON.stringify([[["Fbv4je", inner, null, "generic"]]]),
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    )
    const json = JSON.parse((await res.text()).split("\n\n")[1])
    const resolved = JSON.parse(json[0][2])[1]
    return /^https?:\/\//.test(resolved) ? resolved : null
  } catch (err) {
    console.warn(`  [WARN] Google ニュースURL解決失敗: ${err.message}`)
    return null
  }
}

const htmlToText = (html) => {
  const $ = cheerio.load(html)
  $("script, style, noscript, svg, header, footer, nav").remove()
  return $("body")
    .text()
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim()
    .slice(0, MAX_TEXT_LENGTH)
}

const EXTRACTION_SYSTEM_PROMPT = `あなたは地域メディア「新宿ライブ」の情報抽出アシスタント。
Webページのテキストから、新宿区内のイベント・公演・展示・POP UP・コラボ・イルミネーション・新規オープン・閉店・セール・キャンペーン・地域ニュースなどの記事候補を抽出する。

出力はJSON配列のみ。説明文やコードブロック(\`\`\`)で囲まない。該当情報がなければ空配列 [] を返す。

各要素のフォーマット:
{
  "type": "event または news",
  "title": "記事タイトル(固有名詞と日付を含め簡潔に。新規オープンは「【エリア名】店名が◯月◯日オープン」の形)",
  "summary": "1〜2文の要約",
  "body": "本文(Markdown)。冒頭の導入段落、「## 見どころ」等の見出しで詳細、最後に「## 開催概要」(新店は「## 店舗情報」)の箇条書きで期間・時間・会場・住所・料金・アクセス等。ページに書かれている事実だけで構成する",
  "category": "${CATEGORIES.join(" | ")} のいずれか",
  "area": "${Object.keys(AREAS).join(" | ")} のいずれか",
  "tags": "${Object.keys(THEMES).join(" | ")} から該当するものの配列",
  "published_at": "YYYY-MM-DD(ページに公開日があればその日、なければ今日)",
  "start_at": "YYYY-MM-DD または null",
  "end_at": "YYYY-MM-DD または null",
  "place_name": "会場・店舗・施設名 または null",
  "image_index": "本文に最も合う画像候補の番号(整数) または null",
  "link_index": "その記事の個別詳細ページに当たるリンク候補の番号(整数) または null"
}

ルール:
- 新宿区内(${Object.values(AREAS).join("、")})の情報だけを抽出する。会場が新宿区外の情報は除外する(タカシマヤ タイムズスクエア・新宿サザンテラス・新宿南口など新宿駅に隣接する施設は含める)
- areaは会場が属するエリア(${Object.entries(AREAS)
  .map(([key, name]) => `${key}=${name}`)
  .join("、")})。判断できない場合は${DEFAULT_AREA}
${THEME_RULE}
- ページに書かれていない日時・料金・住所・出演者などは推測で補わない。不明な日付はnull、本文では「詳細は公式サイトで確認を」と書く
- 本文に感想・推測・誇張(「〜だろう」「注目が集まりそう」等)を書かない
- 今日より前にend_atが過ぎているイベント、開店日が過ぎて1か月以上たった新店情報は除外する
- サイトの案内文・常設情報・求人・募集・入札・選挙の開票結果など、来訪者向けでない一般的すぎる情報は抽出しない
- start_at/end_atで期間が決まるイベント系はtype="event"。新規オープン・閉店・ニュースはtype="news"(新規オープンはstart_atにオープン日、閉店はstart_atに閉店日)
- 一日だけのイベントはstart_atとend_atを同じ日にする
- image_indexは「画像候補」から記事の内容(タイトル・alt)と最も合うものを1つ選ぶ。ロゴ・バナー・アイコンなど無関係なものは選ばない
- link_indexは「リンク候補」から記事単体のページへのリンクを1つ選ぶ。カテゴリ一覧・ページ送り・外部サービスは選ばない`

// claude CLIをheadlessで呼び出す。stdinは即座に閉じる(開いたままだとCLIが入力待ちで遅延する)
const runClaude = (userPrompt) =>
  new Promise((resolve, reject) => {
    const child = execFile(
      "claude",
      [
        "-p",
        userPrompt,
        "--output-format",
        "json",
        "--model",
        MODEL,
        "--effort",
        "low",
        "--system-prompt",
        EXTRACTION_SYSTEM_PROMPT,
        "--allowedTools",
        "",
        "--safe-mode",
      ],
      { cwd: root, timeout: CLAUDE_TIMEOUT_MS, maxBuffer: 20 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          err.stderr = stderr
          reject(err)
          return
        }
        try {
          resolve(JSON.parse(stdout))
        } catch (parseErr) {
          reject(parseErr)
        }
      }
    )
    child.stdin?.end()
  })

const runClaudeWithRetry = async (userPrompt, sourceId) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await runClaude(userPrompt)
    } catch (err) {
      const isTimeout = err?.killed === true || err?.signal === "SIGTERM"
      const message = err?.stderr || err?.message || String(err)
      const isRateLimited = /429|rate_limit|overloaded/i.test(message)
      const reason = isTimeout ? "timeout" : isRateLimited ? "rate_limit" : null
      if (reason && attempt < RETRY_DELAYS_MS.length) {
        const wait = RETRY_DELAYS_MS[attempt]
        console.warn(
          `  [RETRY] ${sourceId}: ${reason}、${wait / 1000}秒後に再試行 (${attempt + 1}/${RETRY_DELAYS_MS.length})`
        )
        await sleep(wait)
        continue
      }
      console.warn(
        `  [ERROR] ${sourceId}: code=${err?.code} signal=${err?.signal} ${message.slice(0, 200)}`
      )
      throw err
    }
  }
}

const formatImageCandidates = (candidates) =>
  candidates
    .slice(0, MAX_IMAGE_CANDIDATES)
    .map((c, i) => `${i}: ${c.url}${c.alt ? ` (alt: ${c.alt})` : ""}`)
    .join("\n")

const formatLinkCandidates = (candidates) =>
  candidates.map((c, i) => `${i}: ${c.text} (${c.url})`).join("\n")

// detail=true: 個別記事ページとして主題の記事1件のみ抽出させる
const extractContents = async (
  page,
  text,
  imgCandidates,
  today,
  { linkCandidates = [], detail = false } = {}
) => {
  if (!text) return []
  const imageBlock = imgCandidates.length
    ? `\n\n--- 画像候補 ---\n${formatImageCandidates(imgCandidates)}`
    : ""
  const linkBlock = linkCandidates.length
    ? `\n\n--- リンク候補 ---\n${formatLinkCandidates(linkCandidates)}`
    : ""
  const detailNote = detail
    ? "\n※このページは個別記事ページ。ページの主題となる記事1件のみを抽出する(関連記事・おすすめ等は除外)。"
    : ""
  const userPrompt = `情報源: ${page.name}
URL: ${page.url}
今日の日付: ${today}${detailNote}

--- ページ本文 ---
${text}${imageBlock}${linkBlock}`

  const result = await runClaudeWithRetry(userPrompt, page.id)
  if (result.is_error) {
    console.warn(
      `  [WARN] Claude実行エラー: ${String(result.result ?? "").slice(0, 200)}`
    )
    return []
  }
  const raw = String(result.result ?? "")
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    console.warn(`  [WARN] JSON解析失敗: ${page.id}`)
    return []
  }
}

// 一覧ページ内のリンクを個別記事ページの候補として抽出する(ヘッダー・フッター・ナビは除外)
const extractLinkCandidates = (html, baseUrl) => {
  const $ = cheerio.load(html)
  $("header, footer, nav").remove()
  const base = new URL(baseUrl)
  base.hash = ""
  const seen = new Set()
  const links = []
  $("body a[href]").each((_, el) => {
    let url
    try {
      url = new URL($(el).attr("href"), baseUrl)
    } catch {
      return
    }
    if (!/^https?:$/.test(url.protocol)) return
    if (/\.(pdf|jpe?g|png|gif|webp|zip)$/i.test(url.pathname)) return
    url.hash = ""
    const text = $(el).text().replace(/\s+/g, " ").trim().slice(0, 80)
    if (text.length < 4 || url.href === base.href || seen.has(url.href)) return
    seen.add(url.href)
    links.push({ url: url.href, text })
  })
  return links.slice(0, MAX_LINK_CANDIDATES)
}

// 個別ページはog:imageを先頭候補にする(記事の代表画像であることが多い)
const imageCandidatesOf = (html, url) => {
  const candidates = extractImgCandidates(html, url).filter((c) => !c.excluded)
  const og = extractMetaImage(html, url)
  return og && !candidates.some((c) => c.url === og)
    ? [{ url: og, alt: "og:image" }, ...candidates]
    : candidates
}

// 抽出結果の日付・期間を検証する。採用しない場合はnull
const sanitize = (candidate, today) => {
  if (!candidate?.title || !CATEGORIES.includes(candidate.category)) return null
  const start = isDate(candidate.start_at) ? candidate.start_at : null
  const end = isDate(candidate.end_at) ? candidate.end_at : null
  if (end && start && end < start) return null
  if (candidate.type === "event" && (end ?? start) && (end ?? start) < today)
    return null
  const published = isDate(candidate.published_at)
    ? candidate.published_at
    : today
  return {
    ...candidate,
    start_at: start,
    end_at: end,
    published_at: published > today ? today : published,
  }
}

const main = async () => {
  if (!dryRun) mkdirSync(imagesOutDir, { recursive: true })
  const sources = readJson(sourcesPath)
  const places = readJson(placesPath)
  const contents = readJson(contentsPath)

  const targetSources = (
    onlySourceIds
      ? sources.filter((s) => onlySourceIds.includes(s.id))
      : sources.filter((s) => s.crawl !== false)
  ).slice(0, sourceLimit)
  if (targetSources.length === 0) {
    console.error(`source not found: ${onlySourceIds?.join(",")}`)
    process.exit(1)
  }

  const today = jstToday()
  let nextId = contents.reduce((max, c) => Math.max(max, c.id), 0) + 1
  const newContents = []
  const summary = { fetched: 0, failed: 0, extracted: 0, merged: 0, added: 0 }
  const all = () => [...contents, ...newContents]
  const findByUrl = (url) =>
    all().find((c) => c.source_url === url || c.source_urls?.includes(url))

  // 選ばれた画像を public/images/contents/{id}.{ext} に保存し、公開パスを返す
  const pickImage = async (imgCandidates, imgIndex, referer, id) => {
    if (
      !Number.isInteger(imgIndex) ||
      imgIndex < 0 ||
      imgIndex >= Math.min(imgCandidates.length, MAX_IMAGE_CANDIDATES)
    )
      return null
    const imageUrl = imgCandidates[imgIndex].url
    if (dryRun) return imageUrl
    try {
      const buf = await downloadImage(imageUrl, referer)
      if (!buf || buf.length < 2000) return null
      const ext = guessExt(imageUrl, null)
      writeFileSync(path.join(imagesOutDir, `${id}.${ext}`), buf)
      return `/images/contents/${id}.${ext}`
    } catch (err) {
      console.warn(`  [WARN] 画像取得失敗: ${err.message}`)
      return null
    }
  }

  const mergeCandidate = async (existing, candidate, page, imgCandidates) => {
    if (!mergeIntoExisting(existing, candidate, page.url, page.listingUrl)) {
      console.log(`  [EXISTS] ${existing.title}`)
      return
    }
    summary.merged++
    console.log(`  [MERGE] ${existing.title} ← ${candidate.title}`)
    if (!existing.image_url)
      existing.image_url = await pickImage(
        imgCandidates,
        candidate.image_index,
        page.url,
        existing.id
      )
  }

  const addCandidate = async (raw, page, imgCandidates) => {
    const candidate = sanitize(raw, today)
    if (!candidate) return
    const duplicate = findDuplicate(all(), candidate, page.id)
    if (duplicate) {
      await mergeCandidate(duplicate, candidate, page, imgCandidates)
      return
    }
    const id = nextId++
    const content = {
      id,
      type: candidate.type === "event" ? "event" : "news",
      title: candidate.title,
      summary: candidate.summary ?? "",
      body: candidate.body ?? candidate.summary ?? "",
      category: candidate.category,
      area: Object.hasOwn(AREAS, candidate.area ?? "")
        ? candidate.area
        : DEFAULT_AREA,
      tags: parseTags(candidate.tags),
      published_at: candidate.published_at,
      start_at: candidate.start_at,
      end_at: candidate.end_at,
      place_id: findPlaceId(places, candidate.place_name),
      source_id: page.id,
      source_url: page.url,
      image_url: await pickImage(
        imgCandidates,
        candidate.image_index,
        page.url,
        id
      ),
    }
    newContents.push(content)
    summary.added++
    console.log(
      `  [NEW] ${content.title}${content.image_url ? " (画像あり)" : ""}`
    )
  }

  // 個別ページを取得し主題の記事1件を抽出する。失敗時はnull
  const extractFromDetail = async (page) => {
    await sleep(SOURCE_INTERVAL_MS)
    console.log(`  取得中: ${page.url}`)
    try {
      const html = await fetchHtml(page.url)
      const imgCandidates = imageCandidatesOf(html, page.url)
      const results = await extractContents(
        page,
        htmlToText(html),
        imgCandidates,
        today,
        { detail: true }
      )
      return { candidate: results[0] ?? null, imgCandidates }
    } catch (err) {
      console.warn(`  [WARN] 個別ページ取得失敗: ${err.message}`)
      return null
    }
  }

  for (const source of targetSources) {
    console.log(`[${source.id}] 取得中: ${source.url}`)
    let html
    try {
      html = await fetchHtml(source.url)
      if (/^\s*(<\?xml[^>]*>\s*)?<rss/.test(html)) html = rssToHtml(html)
      summary.fetched++
    } catch (err) {
      console.warn(`  [SKIP] 取得失敗: ${err.message}`)
      summary.failed++
      continue
    }

    const listing = { ...source, listingUrl: source.url }
    const imgCandidates = extractImgCandidates(html, source.url).filter(
      (c) => !c.excluded
    )
    const linkCandidates = extractLinkCandidates(html, source.url)

    let candidates
    try {
      candidates = await extractContents(
        source,
        htmlToText(html),
        imgCandidates,
        today,
        { linkCandidates }
      )
    } catch (err) {
      console.warn(`  [SKIP] 抽出失敗: ${err.message}`)
      continue
    }
    summary.extracted += candidates.length

    // 個別ページがあれば取得してそちらを出典にする。取得失敗・記事なしなら一覧の抽出結果を使う
    const visited = new Set()
    for (const candidate of candidates) {
      if (!sanitize(candidate, today)) continue
      let detailUrl = Number.isInteger(candidate.link_index)
        ? (linkCandidates[candidate.link_index]?.url ?? null)
        : null
      if (detailUrl?.startsWith("https://news.google.com/rss/articles/"))
        detailUrl = await resolveGoogleNewsUrl(detailUrl)

      // 既存記事があれば個別ページは開かず、一覧で得た情報を反映するだけにする
      const existing =
        (detailUrl && findByUrl(detailUrl)) ||
        findDuplicate(all(), candidate, source.id)
      if (existing) {
        const page = detailUrl ? { ...listing, url: detailUrl } : listing
        await mergeCandidate(existing, candidate, page, imgCandidates)
        continue
      }

      if (
        !detailUrl ||
        visited.has(detailUrl) ||
        visited.size >= MAX_DETAIL_PAGES
      ) {
        await addCandidate(candidate, listing, imgCandidates)
        continue
      }
      visited.add(detailUrl)

      const page = { ...listing, url: detailUrl }
      const detail = await extractFromDetail(page)
      if (detail?.candidate)
        await addCandidate(detail.candidate, page, detail.imgCandidates)
      else await addCandidate(candidate, listing, imgCandidates)
    }

    await sleep(SOURCE_INTERVAL_MS)
  }

  console.log("\n--- サマリー ---")
  console.log(`情報源 取得成功: ${summary.fetched} / 失敗: ${summary.failed}`)
  console.log(
    `抽出候補: ${summary.extracted} / 重複統合: ${summary.merged} / 新規追加: ${summary.added}`
  )

  if (dryRun) {
    for (const c of newContents)
      console.log(`  - [${c.category}/${c.area}] ${c.title} (${c.source_url})`)
    console.log("\n[dry-run] ファイルは更新していない")
    return
  }
  if (newContents.length > 0 || summary.merged > 0) {
    writeJson(contentsPath, all())
    console.log(
      `\ndata/contents.json を更新(新規${newContents.length}件・統合${summary.merged}件)`
    )
  } else {
    console.log("\n更新なし")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
