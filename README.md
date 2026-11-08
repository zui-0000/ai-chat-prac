# ai-chat-prac

AI チャットの画面を作る学習用リポジトリ。

- 土台: [Void](https://void.cloud)（FE と BE を 1 つの Cloudflare Worker にまとめる）と [Vite+](https://viteplus.dev/)（`vp`）
- API: [oRPC](https://orpc.dev/) の約束（contract）を先に書く
- FE: React + TanStack Router + TanStack Query

## 構成

```text
apps/web/              Void のアプリ
├── src/client/        FE（ブラウザで動く）。TanStack Router のルートは src/client/routes、偽物の BE（MSW）は src/client/mocks
└── src/server/        BE（Worker で動く）。Void はここだけを読む
packages/contract/     FE と BE の約束（oRPC + zod）
```

## セットアップ（初回のみ）

Node.js と pnpm は `vp` が用意する。必要なのは Git と `vp`（1.5.0 以上）だけ。

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
| 依存を足す                       | `vp add <名前> --filter <パッケージ>` | `<パッケージ>` は `web` か `@ai-chat/contract`。版は catalog に固定で入る  |
| DB のマイグレーションを作る      | `vp run db:generate`                  | `apps/web/src/server/db/schema.ts` から作る                                |

### 開発サーバー

`vp run dev` で、FE と BE が両方立ち上がる。開くのは <http://localhost:5173/> の 1 つだけでよい。

**画面は、いつも偽物の BE（MSW、`apps/web/src/client/mocks`）と話す。** 本物の BE を画面から確かめるときは、`vp run build` してから `vp run preview` を使う。

| 立ち上がるもの      | 動かすもの                                                   | ポート                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------ |
| Vite の開発サーバー | FE（`apps/web/src/client`）。HMR もここ                      | 5173                           |
| workerd             | BE（`apps/web/src/server`）。Cloudflare Workers のランタイム | 内部のポート（直接は開かない） |

- Vite が入口になり、`/rpc` などの BE 宛てのリクエストを workerd に渡す。FE と BE が同じオリジンなので、CORS やプロキシの設定は要らない
- BE は本番と同じ workerd で動くので、ローカルと Cloudflare での挙動がずれにくい
- 本物の BE も立ち上がるが、画面の `/rpc` は MSW の Service Worker が先に返すので、本物には届かない
- 起動時に DB のマイグレーションが自動で流れる。ローカルの D1 は `apps/web/.void/v3/d1/` の SQLite ファイル。このフォルダを消すと、次の起動でマイグレーションから作り直され、データが空に戻る

### 失敗の画面を見る

URL に `?scenario=<名前>` を付けると、MSW が失敗の応答を返す。コードは書き換えない。外して読み直せば元に戻る。

```text
http://localhost:5173/?scenario=message.create.error
```

名前は `<API>.<状態>`（例: `message.list.many`・`chat.stream.slow`）。各 API のシナリオは `apps/web/src/client/mocks/api/<API>/scenarios.ts` にある。知らない名前を付けると、正常系で動きつつ、使える名前の一覧をコンソールに出す。

## コミット時に自動で実行されること

pre-commit フックが `vp staged` で、次の順に 1 つずつ実行する。どれかが失敗するとコミットは止まり、ファイルは元に戻る。

| 順番 | 実行するもの           | 対象                                      | 内容                                                                |
| ---- | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| 1    | `vp check --fix`       | ステージしたすべてのファイル              | 整形と lint。自動で直せるものは直してコミットする                   |
| 2    | `vp run web#lint:deps` | `apps/web` の TS を変えたとき             | import の向き                                                       |
| 3    | `vp run typecheck`     | `apps/` か `packages/` の TS を変えたとき | 全体の型チェック。contract を変えて実装が合わなくなったときも止まる |

そのあと、commit-msg フックが commitlint でコミットメッセージを検査する。`feat: ヘッダーを作る` のように `<type>: <説明>` の形で書く。
