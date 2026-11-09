# import のパス

記録日: 2026-11-08（2026-11-09 に `~/` から `#/` に変えた） / 対象: Void 1.6.2、Vite+ 1.5.0、tsrs 0.23.0-ts7.1.0-beta、TypeScript 7.0.2、dependency-cruiser 18.7.2

2026-11-09 に、次の記事を読んで、tsconfig の `paths`（`~/`）から `package.json` の `imports`（`#/`）に乗り換えた。

- 「パスエイリアスには Subpath Imports を使いたい」（mediba、2026-11-05）: https://zenn.dev/mediba/articles/167e2a3f663889

`apps/web/src` の下は、`#/` から書ける。2 つ以上上のフォルダへの相対パス（`../../`）は使わず、`#/` から書く。`#/` のときだけ、拡張子まで書く。

```ts
import { client, orpc } from "#/client/orpc.ts"; // ../../../orpc と書かない
import { router } from "#/server/rpc/router.ts"; // ../../rpc/router と書かない
import { theme } from "../theme"; // 1 つ上までは相対パスでよい。拡張子は書かない
```

`../` を 1 つは許す。`__tests__/` から確かめるファイルを読むとき（`../draft`）や、同じまとまりの中のファイルを読むときは、相対パスの方が近くて読みやすい。

## package.json の imports で決める

エイリアスは、Node.js 標準の Subpath Imports（`package.json` の `imports`）で決める。tsconfig の `paths` は使わない。

```json
// apps/web/package.json
{
  "imports": { "#/*": "./src/*" }
}
```

TypeScript（`moduleResolution: "bundler"`）・Vite・Vitest・dependency-cruiser が、どれもこの 1 か所を読む。`vite.config.ts` の `resolve.alias` も要らない。

Subpath Imports は、名前が `#` から始まる決まり（Node.js の仕様）。`~/` や `@/` は使えない。npm のパッケージ（`@scope/name`）と見分けやすい。

### 拡張子を書く

`#/client/orpc` と拡張子なしで書くと、TypeScript は「モジュールが見つからない」（TS2307）で止まる。`imports` の置き換え先（`./src/client/orpc`）に、TypeScript は `.ts` を補わない。

| 試したこと                                  | tsrs                        |
| ------------------------------------------- | --------------------------- |
| `"#/*": "./src/*"`、拡張子なしで import     | 12 か所が見つからない       |
| `"#src/*": "./src/*"`、拡張子なしで import  | 同じ（`#/` のせいではない） |
| `"#/*": "./src/*"`、拡張子まで書いて import | 通る                        |

置き換え先を `["./src/*.ts", "./src/*.tsx", "./src/*"]` の配列にしても tsrs は通ったが、使わない。Node.js の仕様では、配列は「前の候補が不正な書き方のときの予備」で、ファイルがあるかどうかで次に進むものではない。道具によって解釈が変わる。

拡張子を書くので、`tsconfig.app.json` に `allowImportingTsExtensions` を足した（`noEmit` のときだけ使える）。

Vite は拡張子なしでも解決してしまうので、書き忘れに気づけるのは型チェックだけ。`typecheck` はコミットのときに動くので、すり抜けない。

## 前は tsconfig の paths で決めていた

2026-11-08 は `~/` を tsconfig の `paths` と Vite の `resolve.alias` の 2 か所で決めていた。これには、Void と食い合う問題があった。

`apps/web/tsconfig.app.json` は、Void が作る `.void/tsconfig.json` を extends している。`.void/tsconfig.json` は `paths` で `void/db`・`@schema` などの型を当てている。tsconfig の `extends` は `paths` を混ぜないので、`tsconfig.app.json` に `paths` を書くと、Void の `paths` が丸ごと上書きされて消える。Void のソース（`codegen/project-tsconfig.ts`）を読むと、`.void/tsconfig.json` の `paths` は毎回ゼロから作り直していて、こちらのエイリアスを足す仕組みもない。

そこで、Void の `paths` を `tsconfig.app.json` に写し、写し忘れを `scripts/check-tsconfig-paths.mjs` で止めていた。写し忘れても多くは型エラーになるが、`void/db` を写し忘れると、正しいコード（`db.query.messages`）までエラーになり、メッセージも「`Seems like the schema generic is missing`」と原因と関係ない場所を指したため。

`imports` に変えたので、`tsconfig.app.json` に `paths` を書かなくて済む。Void の `paths` はそのまま引き継がれ、写す作業・見張るスクリプト・`resolve.alias` がすべて要らなくなった。Void がキーを足しても（`void/queues` など）、何もしなくてよい。

冒頭の記事（https://zenn.dev/mediba/articles/167e2a3f663889 ）を読んで、乗り換えた。

## ../../ を lint で止める

ルートの `vite.config.ts` の lint の `overrides` で、`apps/web/src/**` に `no-restricted-imports` をかけた。`../../*` と `../../**` を止める。テストのファイルの中の `../../` も止まる。

## dependency-cruiser は Void の名前を名前で止める

dependency-cruiser は、`#/` を `imports` から正しく解決する（種類は `aliased-subpath-import`）。一方で、extends 先の `.void/tsconfig.json` の `paths` はたどれず、`@schema`・`void/db` は名前のまま残る。

| import    | paths を写していたとき    | imports にした後        |
| --------- | ------------------------- | ----------------------- |
| `@schema` | `src/server/db/schema.ts` | `@schema`（名前のまま） |
| `void/db` | `.void/db.d.ts`           | `void/db`（名前のまま） |

そこで、FE と偽物から BE 専用のモジュールを止めるルール（`client-not-to-server-modules`・`mocks-not-to-db`）は、`^(@schema|void/db|void/schema-…)` の名前で比べる。dependency-cruiser に Void の `paths` を読ませる道もあるが、写す作業を dependency-cruiser の設定に移すだけなので選ばなかった。

使い捨てのファイルで、わざと違反を入れて確かめた。

| import する側 | import                            | 止めたルール                   |
| ------------- | --------------------------------- | ------------------------------ |
| FE の部品     | `@schema`                         | `client-not-to-server-modules` |
| FE の部品     | `void/db`                         | `client-not-to-server-modules` |
| FE の部品     | `#/server/rpc/router.ts`          | `client-not-to-server`         |
| FE の部品     | `#/client/mocks/browser.ts`       | `client-not-to-mocks`          |
| 偽物          | `@schema`                         | `mocks-not-to-db`              |
| 偽物          | `void/db`                         | `mocks-not-to-db`              |
| テスト        | `#/client/mocks/api/scenarios.ts` | `mocks-entry-only`             |

## 確かめたこと

- `vp check`・`vp run typecheck`・`vp run lint:deps`・`vp run test`・`vp run build` が通る
- エディタの TypeScript 7.0.2（`tsc`）でも通る
- 開発サーバーで、FE は `#/client/mocks/browser.ts` を読める。BE（workerd）は `#/server/rpc/router.ts` を読めて、`/rpc` の作成と一覧が動く
- 本番のビルドに、解決されていない `#/` の import が残らない

## 参考

- 「パスエイリアスには Subpath Imports を使いたい」（mediba、2026-11-05）: https://zenn.dev/mediba/articles/167e2a3f663889
- Node.js の Subpath Imports の仕様: https://nodejs.org/api/packages.html#subpath-imports
