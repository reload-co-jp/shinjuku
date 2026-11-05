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

`data/sources.json` に一覧(`source_type` と優先度 `priority` 付き)。主なもの:

### 公的・地域情報

- 新宿区: https://www.city.shinjuku.lg.jp/
- 新宿区 新着情報: https://www.city.shinjuku.lg.jp/backnumber.html
- 新宿観光振興協会 イベント: https://www.kanko-shinjuku.jp/event/-/index.html
- 新宿観光振興協会 新着情報: https://www.kanko-shinjuku.jp/topics/-/index.html
- 環境省 新宿御苑 お知らせ: https://policies.env.go.jp/national-garden/shinjukugyoen/news/
- 新宿中央公園 イベント: https://shinjukuchuo-park.jp/events/
- TOKYO Night & Light(都庁プロジェクションマッピング): https://tokyoprojectionmappingproject.jp/
- GO TOKYO: https://www.gotokyo.org/jp/

### 寺社・季節行事

- 花園神社: http://hanazono-jinja.or.jp/(酉の市・例大祭)
- 十二社 熊野神社: https://www.12so-kumanojinja.or.jp/
- 赤城神社(神楽坂): https://www.akagi-jinja.jp/

### 公演・ライブ・映画

- 紀伊國屋ホール・紀伊國屋寄席: https://store.kinokuniya.co.jp/event/
- 新宿末廣亭: https://www.suehirotei.com/
- THEATER MILANO-Za: https://www.milano-za.jp/
- Zepp Shinjuku: https://www.zepp.co.jp/hall/shinjuku/schedule/
- 新宿LOFT: https://www.loft-prj.co.jp/schedule/loft
- 東京オペラシティ コンサートカレンダー: https://www.operacity.jp/concert/calendar/
- 新宿ピカデリー: https://www.smt-cinema.com/site/shinjuku/

### 美術館・展示

- SOMPO美術館: https://www.sompo-museum.org/exhibitions/schedule/
- 東京オペラシティ アートギャラリー: https://www.operacity.jp/ag/
- 草間彌生美術館: https://yayoikusamamuseum.jp/
- 早稲田大学演劇博物館: https://enpaku.w.waseda.jp/
- 新宿歌舞伎町春画展: https://www.smappa.net/shunga/

### 商業施設・広場

- 東急歌舞伎町タワー: https://www.tokyu-kabukicho-tower.jp/
- 歌舞伎町タウン・マネージメント: https://www.d-kabukicho.com/events/
- 新宿住友ビル三角広場: https://www.sumitomo-sankakuhiroba.jp/event/
- 新宿パークタワー: https://www.shinjukuparktower.com/
- 伊勢丹新宿店 / 新宿高島屋 / 小田急百貨店 / 京王百貨店
- ルミネ新宿 / ルミネエスト新宿 / NEWoMan新宿 / 新宿マルイ
- 神楽坂通り商店会: https://www.kagurazaka.in/

### プレスリリース・ニュース(エリア別検索)

- PR TIMES: 新宿・西新宿・歌舞伎町・新宿三丁目・新大久保・高田馬場・神楽坂・四谷
- Google ニュース RSS: 同上(四谷は同名地名と区別するため「四谷 新宿区」)
- @Press
- 新宿ニュースBlog: https://shinjukunews.com/
- Daily Shinjuku: https://daily-shinjuku.tokyo/

### イベントプラットフォーム・グルメ

- 新宿イベント情報: https://www.shinjukuevent.com/
- ウォーカープラス 新宿区: https://www.walkerplus.com/event_list/ar0313104/shinjuku/
- レッツエンジョイ東京 新宿駅周辺: https://www.enjoytokyo.jp/event/list/sta200211/
- ジョルダン イルミネーション特集: https://sp.jorudan.co.jp/illumi/
- 食べログ 新宿・代々木・大久保: https://tabelog.com/tokyo/A1304/(新店候補の発見用)

### 情報源の優先順位

1. 行政・公的機関
2. 寺社・施設・店舗の公式サイト
3. 公式プレスリリース
4. イベントプラットフォーム・地域Webメディア・ニュース検索
5. 食べログ等

### 情報源の扱い

- 公式サイト・行政を一次情報として優先する
- イベントプラットフォーム・まとめサイトは候補の発見に使い、日程・料金・会場は公式情報で再確認する
- 画像はプレスリリース・公式の告知画像のみ `public/images/contents/` に保存し、出典URLを `source_url` に残す
- 確認できない項目(時間・料金など)は推測で書かず「公式サイトで確認を」と記す

## 4. 記事の自動取得

`scripts/fetch-contents.mjs` が `data/sources.json` の情報源(`crawl: false` を除く)を巡回し、Claude Code CLI(headless)で記事候補を抽出して `data/contents.json` に追加する。浅草ライブの同名スクリプトを新宿向けに移植したもの。

```bash
pnpm fetch-contents                          # 全情報源
pnpm fetch-contents --source=kanko-shinjuku  # 情報源を指定(カンマ区切りで複数可)
pnpm fetch-contents --dry-run                # 書き込まずに結果だけ表示
pnpm fetch-contents --limit=5                # 巡回する情報源の数を制限
```

- 認証: `CLAUDE_CODE_OAUTH_TOKEN` または `ANTHROPIC_API_KEY`(claude CLI が解決)。モデルは `ANTHROPIC_MODEL`(既定 `sonnet`)
- 一覧ページから候補を抽出し、個別ページがあれば開いて出典を個別URLにする。Google ニュースのリンクは元記事URLに変換する
- 既存記事との重複はタイトル類似度・開催日で判定(`scripts/lib/dedup.mjs`)。重複時は破棄せず出典URL・本文・タグを補強する
- 終了済みイベント・日付の不正な候補は捨てる。画像は `public/images/contents/{id}.{ext}` に保存
- 分類(カテゴリ・エリア・テーマ)は `scripts/lib/taxonomy.mjs`。`lib/types.ts` と一致することをテストで確認している
- GitHub Actions の `Fetch contents` ワークフローが毎日 JST 5:23 に実行し、テスト・ビルドが通れば commit してデプロイを起動する(手動実行で情報源の指定も可)。リポジトリの Secrets に `CLAUDE_CODE_OAUTH_TOKEN` が必要

## 5. データ

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

## 6. サイト構成

- `/` トップ(今日・今週末・今週・新店舗・最新情報・カテゴリー・エリア・スポット)
- `/events/` 開催中・開催予定のイベントと開催スケジュール
- `/today/` `/this-week/` `/weekend/` `/next-week/` `/this-month/` 日付ページ(毎日0:05 JSTに再ビルド)
- `/events/[year]/[month]/` 月別アーカイブ(10件以上の月のみ)
- `/category/[category]/` `/area/[area]/` `/theme/[theme]/`
- `/place/` `/place/type/[type]/` `/place/[id]/` 施設
- `/content/[id]/` 記事
- `/search/` サイト内検索
- `/sitemap.xml` `/news-sitemap.xml` `/robots.txt`

## 7. コマンド

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build   # out/ に静的出力
```

OGP画像は `scripts/og-image.svg` を元に `public/opengraph-image.png` として書き出している。

## 8. 環境変数

- `NEXT_PUBLIC_GA_ID` GA4 の測定ID。未設定なら `G-7MCDDY9EBF` を使う
- `CLAUDE_CODE_OAUTH_TOKEN` / `ANTHROPIC_API_KEY` 記事の自動取得用
- `ANTHROPIC_MODEL` 記事の自動取得に使うモデル(既定 `sonnet`)

## 9. デプロイ

`main` への push と毎日 JST 0:05 のスケジュールで GitHub Actions がビルドし GitHub Pages に公開する。カスタムドメイン(shinjuku.reload.co.jp)はリポジトリの Pages 設定で指定する。
