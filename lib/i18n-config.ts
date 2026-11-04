// 現在は日本語のみ。浅草ライブと同じ構成にしておき、翻訳版を追加する際はここに言語を足す
export const LOCALES = ["ja"] as const
export type Locale = (typeof LOCALES)[number]

export const HTML_LANG: Record<Locale, string> = {
  ja: "ja",
}

export const localePath = (_locale: Locale, path: string): string => path

export const alternates = (_locale: Locale, path: string) => ({
  canonical: path,
})
