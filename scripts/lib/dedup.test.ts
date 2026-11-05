import { describe, expect, it } from "vitest"
import {
  findDuplicate,
  findPlaceId,
  mergeIntoExisting,
  titleSimilarity,
} from "./dedup.mjs"

const base = {
  id: 1,
  title: "新宿南口「新宿ミナミルミ」11月11日点灯",
  summary: "短い要約",
  body: "短い本文",
  category: "illumination",
  source_id: "jorudan-illumi",
  source_url: "https://example.com/list",
  start_at: "2026-11-11",
  end_at: null,
  tags: ["night"],
}

describe("dedup", () => {
  it("表記揺れのタイトルは類似とみなす", () => {
    expect(
      titleSimilarity(
        "新宿ミナミルミ 11月11日点灯",
        "「新宿ミナミルミ」が11月11日に点灯"
      )
    ).toBeGreaterThan(0.5)
  })

  it("同一ソース・同一開催日の類似タイトルを重複として返す", () => {
    const candidate = {
      title: "新宿ミナミルミが11月11日から点灯",
      category: "illumination",
      start_at: "2026-11-11",
    }
    expect(findDuplicate([base], candidate, "jorudan-illumi")).toBe(base)
  })

  it("開催日が異なれば別記事", () => {
    const candidate = {
      title: "新宿ミナミルミ 11月11日点灯",
      category: "illumination",
      start_at: "2027-11-11",
    }
    expect(findDuplicate([base], candidate, "jorudan-illumi")).toBeNull()
  })

  it("月だけ異なる定期告知は別記事", () => {
    const existing = {
      ...base,
      title: "紀伊國屋寄席 11月の番組",
      start_at: null,
    }
    const candidate = {
      title: "紀伊國屋寄席 12月の番組",
      category: "illumination",
      start_at: null,
    }
    expect(findDuplicate([existing], candidate, "jorudan-illumi")).toBeNull()
  })

  it("別カテゴリ・別ソースは照合しない", () => {
    const candidate = { ...base, category: "event" }
    expect(findDuplicate([base], candidate, "other")).toBeNull()
  })

  it("統合で一覧URLの出典を個別URLに差し替え、長い本文とタグを取り込む", () => {
    const existing = { ...base, tags: [...base.tags] }
    const changed = mergeIntoExisting(
      existing,
      {
        body: "これは既存より長い本文です。",
        summary: "新要約",
        tags: ["free"],
      },
      "https://example.com/detail",
      "https://example.com/list"
    )
    expect(changed).toBe(true)
    expect(existing.source_url).toBe("https://example.com/detail")
    expect(existing.body).toBe("これは既存より長い本文です。")
    expect(existing.tags).toEqual(["night", "free"])
  })

  it("既知の出典・短い本文なら変更なし", () => {
    const existing = { ...base, tags: [...base.tags] }
    expect(
      mergeIntoExisting(existing, { body: "短" }, base.source_url, "x")
    ).toBe(false)
  })

  it("施設名から place_id を引く", () => {
    const places = [{ id: "hanazono-jinja", name: "花園神社" }]
    expect(findPlaceId(places, "花園神社")).toBe("hanazono-jinja")
    expect(findPlaceId(places, "花園神社 境内")).toBe("hanazono-jinja")
    expect(findPlaceId(places, "熊野神社")).toBeNull()
    expect(findPlaceId(places, null)).toBeNull()
  })
})
