---
status: accepted
date: 2026-11-08
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# 土台に Void を採用

## 背景と課題 (Context and Problem Statement)

AI チャットを、いずれ Cloudflare で動かしたい。元にした design-system-prac では、FE（React）と BE（Hono を Bun で動かす）を別のアプリに分けていた。分けると、デプロイの設定・D1 などのリソースの用意・マイグレーションを、アプリごとに手で書くことになる。

## 決定要因 (Decision Drivers)

- Cloudflare Workers と D1 に、少ない設定でデプロイできること
- Cloudflare のアカウントが無くても、手元で本番と同じランタイムで動かせること
- ツールチェーン（Vite+）と素直につながること

## 検討した選択肢 (Considered Options)

- Void で、FE と BE を 1 つの Worker にまとめる
- FE と BE を別のアプリにする（前のリポジトリの形）

## 決定 (Decision Outcome)

**選択: Void で、FE と BE を 1 つの Worker にまとめる**

決め手は、**`void deploy` の 1 つで、ビルド・リソースの用意・マイグレーション・アップロードまで済む**こと。使うリソースは import から推測されるので、`wrangler.jsonc` を手で書かなくてよい。

- FE は `apps/web/src/client/`、BE は `apps/web/src/server/` に置く
- Void が読むのは `src/server` の下だけにする（`sourceDir`）。`src` にすると `src/routes` が API のルートになり、TanStack Router のルートとぶつかる

### 結果 (Consequences)

- Good, because デプロイとリソースの設定を 1 か所で持てる
- Good, because workerd とローカルの D1 で、本番と同じランタイムで動く。FE と同じオリジンなので CORS の設定も要らない
- Good, because ツールチェーンの既定が Vite+ で、検査・テスト・ビルドを `vp` 1 つで回せる
- Bad, because BE を FE と別にデプロイ・スケールできない
- Bad, because Void の作法に寄せることになる。Void の plugin は今いるフォルダを自分のアプリとみなすので、テストや検査は `apps/web` の中で動かす

### 確認方法 (Confirmation)

`vp run build` が通り、`vp run preview` で FE と BE が 1 つのオリジンで動くこと。

## 各選択肢の評価 (Pros and Cons of the Options)

### Void で、FE と BE を 1 つの Worker にまとめる — 採用

- Good, because デプロイ・リソース・マイグレーションをまとめて任せられる
- Good, because Cloudflare のアカウントが無くても手元で動く
- Bad, because 公式の道から外れること（oRPC を載せるなど）は、自分で組む（設計関連/ADR-01）

### FE と BE を別のアプリにする

- Good, because BE を FE と別にデプロイ・スケールできる
- Good, because どちらの道具も自由に選べる
- Bad, because デプロイ・リソース・マイグレーションの設定を 2 つ分持つ
- Bad, because FE と BE が別のオリジンになり、CORS の設定が要る
