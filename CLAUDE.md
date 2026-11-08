<!--
「Vite+ を使う」は vite-plus 1.5.0 の AGENTS.md の日本語訳。VITE PLUS START / END の目印を外してあるので、vp config に上書きされない。
Vite+ を更新したら原文と見比べて反映する。チェックリストの vp test は、テストを入れるまでこのリポジトリの検査に置き換えている。
-->

# Vite+ を使う

このプロジェクトは Vite+ を使っている。Vite+ は、Vite・Rolldown・Vitest・tsdown・Oxlint・Oxfmt・Vite Task をまとめたツールチェーン。Node.js とパッケージマネージャーの管理、フロントエンドのツールを、`vp` という 1 つのグローバルな CLI で扱う。Vite+ は Vite とは別のもので、Vite は `vp dev` や `vp build` を通して呼び出す。コマンドの一覧は `vp help`、コマンドごとの説明は `vp <command> --help` で確認する。

ドキュメントは `node_modules/vite-plus/docs` か <https://viteplus.dev/guide/> にある。

## 組み込みコマンドとスクリプト

`vp <name>` は組み込みコマンドを実行する。`vp run <name>` は `package.json` のスクリプトか `vite.config.ts` のタスクを実行する。スクリプトで組み込みコマンドを上書きすることはできないので、`vp dev` と `vp run dev` は別の動きになることがある。先に `package.json` と `vite.config.ts` を確認し、同じ名前のスクリプトやタスクがあれば `vp run <name>` で実行する。

## スクリプトを動かす

TypeScript と JavaScript のファイルは `vpx <file>` で動かす（例: `vpx ./scripts/seed.ts --dry-run`）。enum・デコレーター・JSX・tsconfig の `paths` も扱えるので、スクリプトを動かすために `tsx` や `ts-node` を足さない。`tsx watch` の代わりに `vpx --watch <file>` を使うと、読んでいるファイルが変わるたびに動かし直す。素の Node.js で動かすときは `vp node <file>`。

## ツールのバージョン

`vp toolchain` で、今の Vite+ に含まれるツールのバージョンと、ツール同士の関係を表示できる。ツール名を付けると、その部分だけを表示する（例: `vp toolchain vite`）。`--global` を付けると、ローカルの `vite-plus` パッケージを無視する。パッケージの依存関係は `vp why <package>` で表示する。

## 作業のチェックリスト

- [ ] リモートの変更を取り込んだ後と、作業を始める前に `vp install` を実行する
- [ ] `vp check`（フォーマット・lint・型チェック）、`vp run typecheck`（各パッケージの `tsrs`）、`vp run lint:deps`（import の向き）、`vp run test`（単体テスト）で、変更を確かめる
- [ ] 確認に必要な `vite.config.ts` のタスクや `package.json` のスクリプトがあれば、`vp run <script>` で実行する
- [ ] セットアップ・Node.js・パッケージマネージャーの動きがおかしいときは `vp env doctor` を実行し、相談するときにその出力を添える

# このリポジトリの決まり

構成と、そう決めた理由は `docs/01-構成を決める.md` にある。単体テストは `docs/02-単体テスト.md`、import のパスは `docs/03-import のパス.md`、MSW は `docs/04-MSW.md`。

## コマンドはルートで実行する

`vp check`・`vp run <script>`・`vp add` などは、リポジトリのルートで実行する。パッケージのフォルダで実行すると、そのパッケージしか検査しない。パッケージだけのスクリプトは `vp run web#<script>` で呼ぶ。

## Void を使う

`apps/web` は Void（`void`）のアプリ。Void の API や作法は、推測せずに `apps/web/node_modules/void/docs/` を読んで確かめる（入口は `apps/web/AGENTS.md`）。

## FE と BE の置き場所

- FE（ブラウザで動く）は `apps/web/src/client/`、BE（Worker で動く）は `apps/web/src/server/` に置く
- Void は `src/server` の下だけを読む（`void.config.ts` の `sourceDir`）。API のルートは `src/server/routes/`、DB は `src/server/db/`
- TanStack Router のルートは `src/client/routes/`。ルートのファイルには `Route` だけを書き、画面の部品は `src/client/components/pages/` に置く
- FE は BE のコードを import しない。FE が BE について知ってよいのは `packages/contract` の約束だけ（`vp run lint:deps` が止める）

## API は約束から作る

- FE と BE の間の API は、`packages/contract` に oRPC の約束（zod のスキーマ）として先に書く
- BE は `src/server/rpc/router.ts` で `implement(contract)` して実装する。`src/server/routes/` に API のルートを増やさない（`/rpc` の受け口だけを置く）
- 約束に API を足したら、偽物にも足す（`src/client/mocks/api/` にフォルダを作り、`api/router.ts` に足す）。偽物も `implement(contract)` しているので、足し忘れると型エラーになる

## 偽物の BE（MSW）

- 偽物は `apps/web/src/client/mocks/` に置く。開発サーバーの画面は、いつも偽物と話す。本物の BE を画面から確かめるときは `vp run preview` を使う
- 偽物は約束（`@ai-chat/contract`）だけを見て実装する。`src/server`・`void/db` を読まない（`vp run lint:deps` が止める）。偽物の中だけは `@orpc/server` を使ってよい
- `src/client` から `src/client/mocks` を読んでよいのは `main.tsx`（`import.meta.env.DEV` の中の動的 import）とテストだけ。本番のバンドルに入れないため
- `mocks/` の直下には入口（`browser.ts`・`node.ts`）だけを置く。外から読むのは入口だけで、テストは `node.ts` から `server`・`scenarios`・`resetMockData` を読む（`vp run lint:deps` が止める）。oRPC と MSW の繋ぎは `mocks/utils/` に置く（ファイル名は `orpc-` から始める）
- API ごとに `src/client/mocks/api/<API>/` を作り、`handler.ts`（正常系）と `scenarios.ts`（失敗などの状態）を置く。フォルダの階層は約束と同じにする
- シナリオは MSW のハンドラではなく、その API の実装（`os.<API>.handler()`）として書き、`satisfies Record<string, typeof handler>` を付ける。新しい API のシナリオは `src/client/mocks/api/scenarios.ts` の `named()` に足す
- シナリオの名前は `<API>.<状態>`（`message.create.error`）。画面では `?scenario=<名前>`（1 つだけ）、テストでは `server.use(scenarios[名前])` で使う
- 保管は、使う API がまとまっているコンテキストの直下に `data.ts` として置く（`api/message/data.ts`）。別のコンテキストからも、持ち主の `data.ts` を読む。テストごとに空に戻すものは `api/reset.ts` に足す

## import のパス

- `apps/web/src` の下は `~/` から書く。`../../` より上への相対パスは使わない（lint が止める）。`../` が 1 つまでは相対パスでよい
- `apps/web/tsconfig.app.json` の `paths` は、`.void/tsconfig.json` の `paths` を写したもの（extends 先の `paths` は上書きされて消えるため）。Void がキーを足したら、`apps/web` から見たパスに直して写す。写し忘れは `typecheck` が止める
- `~` を変えるときは、`tsconfig.app.json` の `paths` と `apps/web/vite.config.ts` の `resolve.alias` の両方を直す

## 単体テスト

- テストは `vp run test`（`test:client`・`test:server`）で動かす。ルートの組み込みの `vp test` は使わない。Void の plugin が今いる場所を自分のプロジェクトとみなすので、`apps/web` の中で動かす
- 確かめるファイルと同じ階層の `__tests__/` に `<名前>.test.ts` で置く。`__tests__/` の外に置かない（`src/server/routes/` の下だと Void の API のルートになる）
- `describe`・`test`・`expect`・`vi` は import しない（`globals: true`）。`it` ではなく `test` を使い、名前は日本語で「〜こと」
- `src/client` のテストは jsdom、`src/server` のテストは Node（DOM なし）で動く

## 依存を足す

- 依存はルートで `vp add <名前> --filter <パッケージ>`（`web` か `@ai-chat/contract`）で足す。版は `pnpm-workspace.yaml` の catalog に固定の版で入り（`savePrefix: ""`）、各 `package.json` には `catalog:` と書かれる
- catalog の版は範囲（`^`・`~`）で書かない。範囲を指定して足したとき（`vp add "pkg@^1.0.0"`）は範囲のまま書かれるので、固定の版に直す
- 公開から 1 日たっていない版は入らない（`minimumReleaseAge`）。止まったら除外せず、1 日たった版を使う
- `tsrs` を上げるときは、新しい版の provenance が `github.com/oxc-project/tsrs` の `release.yml` であることを確かめてから、`trustPolicyExclude` の版を書き換える。一度に新しい版だけにすると、lockfile の古い版が検査で止まるので、古い版と新しい版を `||` で並べて `vp install` し、lockfile から古い版が消えてから外す
