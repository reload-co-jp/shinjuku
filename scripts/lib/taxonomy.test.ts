import { describe, expect, it } from "vitest"
import {
  AREAS as SITE_AREAS,
  CATEGORIES as SITE_CATEGORIES,
  THEMES as SITE_THEMES,
} from "@/lib/types"
import sources from "@/data/sources.json"
import { AREAS, CATEGORIES, DEFAULT_AREA, THEMES } from "./taxonomy.mjs"

// 記事取得スクリプトの分類がサイト側の定義とずれると、取得した記事のページが生成されない
describe("taxonomy", () => {
  it("カテゴリが lib/types.ts と一致する", () => {
    expect([...CATEGORIES].sort()).toEqual(Object.keys(SITE_CATEGORIES).sort())
  })

  it("エリアが lib/types.ts と一致する", () => {
    expect(Object.keys(AREAS).sort()).toEqual(Object.keys(SITE_AREAS).sort())
    expect(Object.hasOwn(AREAS, DEFAULT_AREA)).toBe(true)
  })

  it("テーマが lib/types.ts と一致する", () => {
    expect(Object.keys(THEMES).sort()).toEqual(Object.keys(SITE_THEMES).sort())
  })

  it("情報源のIDが重複しない", () => {
    const ids = sources.map((source) => source.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
