import { Noto_Sans_JP, Oswald } from "next/font/google"

// 見出し(太ゴシック)。和文は分割配信されるためpreloadしない
export const sans = Noto_Sans_JP({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-gothic",
})

// ロゴ・欧文見出し用のコンデンス書体(駅・街の案内サインの印象)
export const display = Oswald({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
})
