# import のパス

記録日: 2026-11-08 / 対象: Void 1.6.2、Vite+ 1.5.0、tsrs 0.22.0-ts7.1.0-beta、dependency-cruiser 18.7.2

`apps/web/src` の下は、`~/` から書ける。2 つ以上上のフォルダへの相対パス（`../../`）は使わず、`~/` から書く。

```ts
import { client, orpc } from "~/client/orpc"; // ../../../orpc と書かない
import { router } from "~/server/rpc/router"; // ../../rpc/router と書かない
import { theme } from "../theme"; // 1 つ上までは相対パスでよい
```

design-system-prac の docs/09 と同じく `~/` にした。違うのは、`../` を 1 つは許すこと。`__tests__/` から確かめるファイルを読むとき（`../draft`）や、同じまとまりの中のファイルを読むときは、相対パスの方が近くて読みやすい。

## 型と実行で、別々に設定する

| 受け持ち                                 | 設定                                                            |
| ---------------------------------------- | --------------------------------------------------------------- |
| 型（tsrs・エディタ・dependency-cruiser） | `apps/web/tsconfig.app.json` の `paths` に `"~/*": ["./src/*"]` |
| 実行（開発サーバー・ビルド・テスト）     | `apps/web/vite.config.ts` の `resolve.alias` に `~`             |

TS で `paths` を書いても、TS は型を見るだけで、実行時の import を書き換えない。Vite が実行時に解決するので、両方に書く。テストは `extends: true` で `resolve.alias` を引き継ぐので、テストからも `~/` で読める。

## Void の paths を写す

`apps/web/tsconfig.app.json` は、Void が作る `.void/tsconfig.json` を extends している。`.void/tsconfig.json` は、`paths` で `void/db`・`@schema` などの型を当てている。

tsconfig の `extends` は、`paths` を混ぜない。`tsconfig.app.json` に `paths` を書くと、`.void/tsconfig.json` の `paths` が丸ごと上書きされて消える。Void のソース（`codegen/project-tsconfig.ts`）を読むと、`.void/tsconfig.json` の `paths` は毎回ゼロから作り直していて、こちらのエイリアスを足す仕組みはない。

そこで、`.void/tsconfig.json` の `paths` を、`tsconfig.app.json` に写した。`.void/` から見たパスを、`apps/web` から見たパスに直す（`./db.d.ts` → `./.void/db.d.ts`）。

### 写し忘れを止める

Void は、プロジェクトの形によって `paths` を足す。

| キー                              | 足される条件                  |
| --------------------------------- | ----------------------------- |
| `void/db`・`@schema`・`@schema/*` | DB のスキーマがあるとき       |
| `void/routes`                     | API のルートがあるとき        |
| `void/queues`                     | キュー（`queues/`）を使うとき |
| `@void/md/pages`                  | Markdown のページを使うとき   |

キューなどを使い始めたり、Void を上げてパスが変わったりすると、写しが古くなる。写しが古くなったときに何が起きるかを、スクリプトを通さずに tsrs だけで試した。

| 写さなかったキー | 起きたこと                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `void/routes`    | 何も起きない。`.void/routes.d.ts` は `declare module "void/routes"` で型を足していて、`.void/tsconfig.json` の `files` で読まれるので、`paths` がなくても型が当たる                        |
| `void/db`        | 型エラーで止まる。ただし、正しいコード（`db.query.messages`）までエラーになり、メッセージは「`Seems like the schema generic is missing`」。`void` パッケージの中の汎用の型に解決されるため |
| `@schema`        | 型エラーで止まる（モジュールが見つからない）                                                                                                                                               |

写し忘れても、多くは型チェックで止まる。ただ、エラーが原因と関係ない場所を指す。`void/db` の例だと Drizzle の使い方を間違えたように見えて、「Void を上げて `.void/tsconfig.json` が変わり、写しが古くなった」という本当の原因にたどり着きにくい。

そこで、`apps/web/scripts/check-tsconfig-paths.mjs` を `typecheck` の最初に動かす。`.void/tsconfig.json` のキーがすべて `tsconfig.app.json` にあって、同じファイルを指しているかを確かめ、合わなければ、どのキーをどう直すかを出して止まる。`typecheck` はコミットのときに動き、あとで作る CI でも動かすので、別にフックの設定を足さなくて済む。

| 試したこと                                    | 結果                                      |
| --------------------------------------------- | ----------------------------------------- |
| `tsconfig.app.json` から `void/routes` を消す | `"void/routes" がありません` で止まった   |
| `@schema` の行き先を別のファイルにする        | `"@schema" の行き先が違います` で止まった |

**手放すもの**: 自前のスクリプトが 1 つ増える。`typecheck` の中に、型チェックそのものではない確認が混ざる。

`tsconfig.app.json` にはコメントがあるので、そのままでは `JSON.parse` で読めない。このリポジトリの tsconfig のコメントは、すべて行の頭からの `//` なので、その行を消して読む。

## ../../ を lint で止める

ルートの `vite.config.ts` の lint の `overrides` で、`apps/web/src/**` に `no-restricted-imports` をかけた。`../../*` と `../../**` を止める。今あった 2 か所（`[...path].ts` と `Chat/index.tsx`）を `~/` に直した。テストのファイルの中の `../../` も止まる。

## dependency-cruiser の穴を 1 つふさいだ

`paths` に Void の分を写したことで、dependency-cruiser が `@schema` と `void/db` を、実体のファイルまでたどれるようになった。

| import    | 前（paths なし）        | 後（paths あり）          |
| --------- | ----------------------- | ------------------------- |
| `@schema` | `@schema`（名前のまま） | `src/server/db/schema.ts` |
| `void/db` | `void/db`（名前のまま） | `.void/db.d.ts`           |

dependency-cruiser のルールは、解決した後のパスで比べる。FE から BE 専用のモジュールを止める `client-not-to-server-modules` は `^void/db` で比べていたので、`void/db` が止まらなくなっていた。`^\.void/db\.d\.ts$` でも止めるように直した。`@schema` は `src/server` の中に解決されるので、場所で止める `client-not-to-server` で止まる。

FE から 1 つずつ import して確かめた。

| FE から import        | 止めたルール                                   |
| --------------------- | ---------------------------------------------- |
| `~/server/rpc/router` | `client-not-to-server`                         |
| `@schema`             | `client-not-to-server`                         |
| `void/db`             | `client-not-to-server-modules`                 |
| `void/schema-d1`      | `client-not-to-server-modules`                 |
| `@orpc/server`        | `client-not-to-server-modules`                 |
| `void/routes`         | 止めない（FE でも使う、型の付いた URL の道具） |

## 確かめたこと

- `vp check`・`vp run typecheck`・`vp run lint:deps`・`vp run test` が通る
- テストから `~/client/orpc`・`~/server/rpc/router` を読める
- 本番のビルドに、解決されていない `~/` が残らない
- 開発サーバーと本番のプレビューで、`/about` の直接表示・oRPC の一覧・作成・ストリーミングが動く（BE の `[...path].ts` も FE の `Chat` も `~/` で import している）
