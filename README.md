# 新宿ライブ

新宿地域メディア(SHINJUKU JOURNAL)

URL: https://shinjuku.reload.co.jp

浅草ライブ(asakusa)・Akiba Live(akiba)と同じ構成の静的サイト。Next.js 16 App Router + React 19 + TypeScript で、`output: "export"` により GitHub Pages へ静的デプロイする。

## 1. 目的

新宿エリアのイベント・新店舗・閉店・セール・キャンペーン・POP UP・公演・展示・イルミネーション・祭り・地域ニュースなどをWebから収集し、施設・イベント・ニュースを構造化して記事を掲載する。

## 2. 対象エリア

記事の `area` は次のいずれか(`lib/types.ts` の `AREAS`)。

- `shinjuku` 新宿駅周辺(東口・西口・南口・新南口)
- `nishishinjuku` 西新宿(都庁・高層ビル街)
- `kabukicho` 歌舞伎町(大久保公園・東急歌舞伎町タワー)
- `sanchome` 新宿三丁目(伊勢丹・マルイ・紀伊國屋・花園神社・ゴールデン街)
- `gyoen` 新宿御苑(新宿御苑前・四谷四丁目)
- `shinokubo` 新大久保(大久保・東新宿)
- `takadanobaba` 高田馬場(早稲田)
- `yotsuya` 四谷
- `kagurazaka` 神楽坂(飯田橋・牛込)

## 3. 情報源

### 公的・地域情報

- 新宿区: https://www.city.shinjuku.lg.jp/
- 新宿区 新着情報: https://www.city.shinjuku.lg.jp/backnumber.html
- 新宿観光振興協会 イベント: https://www.kanko-shinjuku.jp/event/
- 環境省 新宿御苑: https://policies.env.go.jp/national-garden/shinjukugyoen/
- GO TOKYO 新宿: https://www.gotokyo.org/jp/kanko/shinjuku/

### 寺社・季節行事

- 花園神社: http://hanazono-jinja.or.jp/(酉の市・例大祭)
- 十二社 熊野神社: https://www.12so-kumanojinja.or.jp/

### 公演・展示

- 紀伊國屋ホール・紀伊國屋寄席: https://store.kinokuniya.co.jp/event/
- SOMPO美術館: https://www.sompo-museum.org/
- 新宿歌舞伎町春画展: https://www.smappa.net/shunga/

### 商業施設・広場

- 新宿住友ビル三角広場: https://www.sumitomo-sankakuhiroba.jp/event/
- 新宿中央公園: https://shinjukuchuo-park.jp/events/
- 歌舞伎町タウン・マネージメント: https://www.d-kabukicho.com/events/
- ルミネエスト新宿 / 伊勢丹新宿店 / 新宿マルイ / NEWoMan 新宿 の各イベント・トピックスページ

### プレスリリース・イベントプラットフォーム

- PR TIMES「新宿」検索: https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=%E6%96%B0%E5%AE%BF
- @Press
- 新宿イベント情報: https://www.shinjukuevent.com/
- ジョルダン イルミネーション特集(新宿)

### 情報源の扱い

- 公式サイト・行政を一次情報として優先する
- イベントプラットフォーム・まとめサイトは候補の発見に使い、日程・料金・会場は公式情報で再確認する
- 画像はプレスリリース・公式の告知画像のみ `public/images/contents/` に保存し、出典URLを `source_url` に残す
- 確認できない項目(時間・料金など)は推測で書かず「公式サイトで確認を」と記す

## 4. データ

JSON を静的に読み込む(`lib/data.ts`)。

- `data/contents.json` 記事(イベント・ニュース)
- `data/places.json` 施設・スポット
- `data/sources.json` 情報源

### Content

```text
id, type(event|news), title, summary, body(Markdown), category, area, tags?,
published_at, start_at, end_at, place_id, source_id, source_url, source_urls?, image_url
```

- `type: "event"` は `start_at`/`end_at` で今日・今週末・今月などの日付ページに載る
- 新規オープンは `type: "news"` + `category: "new_opening"`、`start_at` にオープン日
- `tags` はテーマページ(`/theme/free|kids|workshop|night/`)用

### カテゴリ

`event` `festival` `performance` `theater` `concert` `new_opening` `closing` `renewal` `sale` `campaign` `popup` `collab` `new_product` `exhibition` `illumination` `facility_news` `local_news` `guide`

### Place

```text
id, name, type, description, address, latitude, longitude, opening_hours, phone,
url, image_url, area, source_id, source_url, updated_at
```

## 5. サイト構成

- `/` トップ(今日・今週末・今週・新店舗・最新情報・カテゴリー・エリア・スポット)
- `/events/` 開催中・開催予定のイベントと開催スケジュール
- `/today/` `/this-week/` `/weekend/` `/next-week/` `/this-month/` 日付ページ(毎日0:05 JSTに再ビルド)
- `/events/[year]/[month]/` 月別アーカイブ(10件以上の月のみ)
- `/category/[category]/` `/area/[area]/` `/theme/[theme]/`
- `/place/` `/place/type/[type]/` `/place/[id]/` 施設
- `/content/[id]/` 記事
- `/search/` サイト内検索
- `/sitemap.xml` `/news-sitemap.xml` `/robots.txt`

## 6. コマンド

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build   # out/ に静的出力
```

OGP画像は `scripts/og-image.svg` を元に `public/opengraph-image.png` として書き出している。

## 7. 環境変数

- `NEXT_PUBLIC_GA_ID` GA4 の測定ID。未設定なら計測タグを出力しない

## 8. デプロイ

`main` への push と毎日 JST 0:05 のスケジュールで GitHub Actions がビルドし GitHub Pages に公開する。カスタムドメイン(shinjuku.reload.co.jp)はリポジトリの Pages 設定で指定する。
