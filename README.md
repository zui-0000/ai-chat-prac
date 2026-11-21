# ai-chat-prac

AI チャットの画面を作る学習用リポジトリ。

- 土台: [Void](https://void.cloud)（FE と BE を 1 つの Cloudflare Worker にまとめる）と [Vite+](https://viteplus.dev/)（`vp`）
- API: [oRPC](https://orpc.dev/) の約束（contract）を先に書く
- FE: React + TanStack Router + TanStack Query
- BE: [Hono](https://hono.dev/)（Void がルーティングに使う）+ Cloudflare D1

## 構成

```text
apps/web/              Void のアプリ
├── src/client/        FE（ブラウザで動く）。TanStack Router のルートは src/client/routes、偽物の BE（MSW）は src/client/mocks
└── src/server/        BE（Worker で動く）。Void はここだけを読む
packages/contract/     FE と BE の約束（oRPC + zod）
```

## セットアップ（初回のみ）

Node.js と pnpm は `vp` が用意する。必要なのは Git と `vp`（1.5.0 以上）だけ。GitHub Actions のワークフローを検査する（`vp run lint:actions`）ときだけ、[uv](https://docs.astral.sh/uv/) も要る。

```zsh
curl -fsSL https://vite.plus | bash   # vp を入れる。終わったら新しいターミナルを開く
vp env install                        # ルートの package.json（devEngines）に書いた版の Node.js と pnpm を入れる
vp install                            # 依存を入れる。Git フックも有効になる
vp hooks status                       # 「Hooks dir: .vite-hooks」と出れば OK
```

- `vp install` の途中で、`apps/web` の `postinstall` が `void prepare` を動かし、Void の型（`apps/web/.void/`）を作る
- Cloudflare のアカウントは要らない。ローカルでは、Cloudflare のランタイムとローカルの D1 で動く

### VS Code を使うとき

1. 拡張機能の画面で `@recommended` と検索し、おすすめの拡張機能を入れる。TypeScript 7 をエディタで使うには、TypeScript Native Preview（`typescriptteam.native-preview`）が要る
2. `.ts` のファイルを開き、コマンドパレットの「Select TypeScript Version...」で「Use Workspace Version」を選ぶ。エディタがリポジトリの版の TypeScript を使うようになる。ワークスペースごとに最初の 1 回だけ要る

### Claude Code のスキル（オーナーのみ）

オーナーは、別の非公開のリポジトリで管理している Claude Code のスキルを使う。セットアップの手順は、そのリポジトリの README にある。ほかの人は何もしなくてよい。

### Claude のレビュー（オーナーのみ）

PR にラベルを貼ると、GitHub Actions で Claude がレビューする。マージの条件には入っていない。

- `claude-review`: 最初のレビュー。このリポジトリのブランチから出した、開いていて下書きでない、既定のブランチに向いた PR だけで動く。外して貼り直すと、もう一度レビューする
- `claude-re-review`: 指摘を直して push し、スレッドに返事してから貼る。このリポジトリのブランチから出した、開いていて下書きでない PR だけで動く。承認しなかったときは外れるので、直したらもう一度貼る

動かすには、次の Secrets と Variables が要る。

| 名前                       | 種類     | 中身                                                |
| -------------------------- | -------- | --------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN`  | Secret   | `claude setup-token` で作るトークン（1 年で切れる） |
| `REVIEWER_APP_CLIENT_ID`   | Variable | レビューに使う GitHub App の Client ID              |
| `REVIEWER_APP_PRIVATE_KEY` | Secret   | その App の秘密鍵                                   |
| `SKILLS_REPO`              | Secret   | レビューの手順を置いた非公開のリポジトリの名前      |
| `SKILLS_MARKETPLACE`       | Secret   | そのリポジトリのマーケットプレイスの名前            |

App の権限は Contents（読み書き）と Pull requests（読み書き）だけにし、Webhook は使わない。権限を変えたら、インストール先で承認し直す。App は、このリポジトリと、レビューの手順を置いた非公開のリポジトリにインストールする。

## よく使うコマンド

コマンドはすべてリポジトリのルートで実行する。パッケージのフォルダで実行すると、そのパッケージしか検査しない。

| やりたいこと                     | コマンド                              | 補足                                                                       |
| -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| 開発サーバーを起動する           | `vp run dev`                          | 画面は偽物の BE（MSW）と話す（下の「開発サーバー」）                       |
| 本番用にビルドする               | `vp run build`                        | 出力先は `apps/web/dist/`                                                  |
| ビルドしたものを確かめる         | `vp run preview`                      | <http://localhost:4173/>。画面は本物の BE と話す。先に `vp run build` する |
| lint + フォーマット + 型チェック | `vp check`                            | 確認だけ。`vp check --fix` で自動修正                                      |
| 各パッケージの型チェック         | `vp run typecheck`                    | 各パッケージの `tsrs --noEmit`（TypeScript の Rust 版）                    |
| 単体テストを実行する             | `vp run test`                         | `client`（jsdom）と `server`（Node）の両方。ルートの `vp test` は使わない  |
| client だけテストする            | `vp run test:client`                  | `apps/web/src/client` の `__tests__/`                                      |
| server だけテストする            | `vp run test:server`                  | `apps/web/src/server` の `__tests__/`                                      |
| import の向きを検査する          | `vp run lint:deps`                    | FE から BE を import していないか（`apps/web/.dependency-cruiser.jsonc`）  |
| ワークフローを検査する           | `vp run lint:actions`                 | GitHub Actions の危ない書き方（zizmor）。uv が要る                         |
| 依存を足す                       | `vp add <名前> --filter <パッケージ>` | `<パッケージ>` は `web` か `@ai-chat/contract`。版は catalog に固定で入る  |
| DB のマイグレーションを作る      | `vp run db:generate`                  | `apps/web/src/server/db/schema.ts` から作る                                |
| タスクのキャッシュを消す         | `vp cache clean`                      | 検査・テスト・ビルドは、変わっていなければ前の結果を出す                   |

### 開発サーバー

`vp run dev` で FE と BE が立ち上がる。開くのは <http://localhost:5173/> だけでよい。

- 画面は、いつも偽物の BE（MSW）と話す。本物の BE を確かめるときは、`vp run build` してから `vp run preview` を使う
- BE は本番と同じ Cloudflare Workers のランタイム（workerd）で動く。FE と同じオリジンなので、CORS の設定は要らない
- 起動時に DB のマイグレーションが流れる。ローカルの D1 は `apps/web/.void/v3/d1/` にあり、消すと空に戻る

### 失敗の画面を見る

URL に `?scenario=<名前>` を付けると、MSW が失敗の応答を返す。コードは書き換えない。外して読み直せば元に戻る。

```text
http://localhost:5173/?scenario=message.create.error
```

名前は `<API>.<状態>`（例: `message.list.many`・`chat.stream.slow`）。各 API のシナリオは `apps/web/src/client/mocks/api/<API>/scenarios.ts` にある。知らない名前を付けると、正常系で動きつつ、使える名前の一覧をコンソールに出す。
