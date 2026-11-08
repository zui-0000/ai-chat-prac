# MSW

記録日: 2026-11-08 / 対象: MSW 3.0.4、oRPC 1.16.2、Vite+ 1.5.0（Vitest 5.1.0）、Void 1.6.2

偽物の BE を MSW で作った。開発サーバーの画面と、`client` の単体テストが使う。

| 使う場所                           | 入口                          | 偽物を動かすもの                            |
| ---------------------------------- | ----------------------------- | ------------------------------------------- |
| 開発サーバーの画面（`vp run dev`） | `src/client/mocks/browser.ts` | ブラウザの Service Worker（`virtual:msw`）  |
| `client` の単体テスト              | `src/client/mocks/node.ts`    | Node の `fetch` の差し替え（`setupServer`） |

本番のビルドとプレビュー（`vp run preview`）では、偽物は動かず、本物の BE と話す。

## 開発サーバーの画面は、いつも偽物と話す

このリポジトリは、`vp run dev` で本物の BE（workerd とローカルの D1）も立ち上がる。それでも、画面はいつも偽物と話す形にした。ts-monorepo-orpc-prac と同じ。

| 案                                    | 決めたか   |
| ------------------------------------- | ---------- |
| URL（`?mock`）で選んだときだけ偽物    |            |
| **いつも偽物**                        | これにした |
| 環境変数（`VITE_MOCK=1`）で切り替える |            |

**手放すもの**: 開発サーバーの画面から、本物の BE を確かめられない。本物は `vp run build` してから `vp run preview` で確かめる。本物の BE も `vp run dev` で立ち上がるが、画面の `/rpc` は Service Worker が先に返すので、本物には届かない。

## 通信の形を真似ず、oRPC を MSW の中で動かす

偽物にするのはクライアントではなく、サーバーの側。画面の oRPC のクライアントは本物のまま、MSW が横取りした通信を、MSW の中で動かす oRPC のサーバー（`RPCHandler`）が受ける。本物の BE が Hono の上で動かしている `RPCHandler` を、MSW の上で動かしているだけ。

```text
画面: client.message.list()（本物のクライアント）
  → POST /rpc/message/list（oRPC の形で包まれた通信）
  → MSW が横取り
  → RPCHandler が通信を開き、偽物の実装（api/message/list）を呼び、返り値を oRPC の形に包んで返す
```

```ts
// src/client/mocks/utils/orpc-handler.ts
export const orpcHandler = (target: OrpcRouter) => {
  const handler = new RPCHandler(target);
  return http.all("*/rpc/*", async ({ request }) => {
    const { matched, response } = await handler.handle(request, { prefix: "/rpc" });
    return matched ? response : undefined;
  });
};
```

- 偽物の実装（`src/client/mocks/api/`）は、本物と同じく `implement(contract)` して作る。返す値が約束とずれると型エラーになる
- oRPC のサーバーの部品（`RPCHandler`）が、通信の形をすべて受け持つ。ストリーミングも、本物と同じ形で返る

### API ごとに生の MSW で書かない理由

ts-monorepo-orpc-prac は、`http.get("/api/users/:id", …)` のように、API ごとに URL を分けてハンドラを書いていた。あちらは OpenAPI の形（URL が API ごとに違う）で通信していたため。

このリポジトリは `RPCLink` で、すべて `/rpc/<API>` に POST する。生の MSW で書くと、`HttpResponse.json({ json: …, meta: [] })` のように oRPC の包みを手で書くことになる。

|                         | API ごとに生の MSW で書く                      | oRPC を MSW の中で動かす（これにした） |
| ----------------------- | ---------------------------------------------- | -------------------------------------- |
| 書くもの                | HTTP の応答（oRPC の包みも手で）               | API の返り値だけ                       |
| 約束とずれたとき        | 気づけない（`HttpResponse.json` は何でも通す） | 型エラーになる                         |
| ストリーミング          | `text/event-stream` の形を手で組む             | `async function*` で `yield` する      |
| oRPC の版が上がったとき | 包みの形が変わると、偽物だけ壊れる             | `RPCHandler` が合わせる                |

一番の理由は、約束とのずれに気づけなくなること。偽物は本物の代わりに画面を支えるので、ずれていると「偽物では動くのに、本物で壊れる」が起きる。

ただし、oRPC の形にならない応答は、生の MSW（`http.*`）で書く。BE が oRPC で答える前提の外なので、`RPCHandler` では作れない。

- ネットワークが切れる（`HttpResponse.error()`）
- 手前のプロキシや Cloudflare が返す、502 や HTML の応答
- 応答が届かない（タイムアウト）

今はまだ要らないので書いていない。要るようになったら、シナリオに生の `http.*` のハンドラも混ぜられるようにする。

### Request の型を合わせる

`RPCHandler` に MSW の `request` をそのまま渡すと、型エラーになった。

```text
error TS2345: Argument of type 'StrictRequest<DefaultBodyType>' is not assignable to parameter of type 'Request<unknown, CfProperties<unknown>>'.
```

`apps/web` の tsconfig は、ブラウザの型（DOM）と Workers の型（`void/env`）の両方を読む。グローバルの `Request` が Workers の形（`cf` を持つ）になり、MSW が渡す DOM の形の `Request` と合わない。中身は同じ `Request` なので、型だけを合わせた（`as unknown as HandledRequest`）。

## フォルダの分け方

API ごとにフォルダを切り、正常系とシナリオを隣に置く。フォルダの階層は約束（`contract`）と同じにする。

フォルダ名は `api/` にした。MSW から見れば、裏が oRPC かどうかは関係なく、「この API をローカルでは偽物にしている」と分かればよいため。`procedures/`（oRPC の用語）は oRPC を知らないと読めず、`contexts/` は React Context の置き場と読み違える。

```text
src/client/mocks/
├── browser.ts             画面用の入口。?scenario= を読む
├── node.ts                単体テスト用の入口。server・scenarios・resetMockData を出す
├── utils/
│   ├── orpc-implementer.ts  os = implement(contract)。各 API の実装の土台
│   └── orpc-handler.ts      oRPC の router を MSW のハンドラにする（RPCHandler）
└── api/
    ├── router.ts          各 API の正常系を集めて、約束どおりの router にする
    ├── scenarios.ts       各 API のシナリオを「<API>.<状態>」の名前で集める
    ├── reset.ts           テストごとに、各コンテキストの保管をすべて空に戻す
    ├── message/
    │   ├── data.ts        保管。message.list と message.create が同じデータを使うので、message の直下に置く
    │   ├── list/
    │   │   ├── handler.ts     正常系
    │   │   └── scenarios.ts   many（30 件）・error
    │   └── create/
    │       ├── handler.ts
    │       └── scenarios.ts   error
    └── chat/
        └── stream/
            ├── handler.ts
            ├── reply.ts       正常系とシナリオが同じ返事の文を使う
            └── scenarios.ts   slow（1 文字ずつ 150 ms）・error（途中で切れる）
src/client/__setup__/
└── setup.ts               client のテストの前に読む。MSW を立ち上げる
```

1 つの API のことは、1 つのフォルダを見れば分かる。API が増えても、`api/router.ts`・`api/scenarios.ts` に 1 行ずつ足すだけで、どのファイルも長くならない。

直下には入口（`browser.ts`・`node.ts`）だけを置き、ほかは役目で分ける。

- `api/`: API の偽物と、それを集める `router.ts`・`scenarios.ts`・`reset.ts`。API を足すときに直すのは `api/` の中だけ
- `utils/`: API の偽物を作るための道具（oRPC と MSW の繋ぎ）。oRPC を使うファイルは名前に `orpc-` を付け、oRPC に寄りかかっている場所が分かるようにした

保管（`data.ts`）は、使う API がまとまっているコンテキスト（`message/` など）の直下に置く。持ち主がはっきりするため。別のコンテキストから使うとき（`chat.stream` の返事を message として保存する、など）も、持ち主のコンテキストの `data.ts` を読む。どのコンテキストにも属さないデータが出てきたら、そのとき共通の置き場を作る。

`mocks/` の外から読んでよいのは、入口の 2 つだけ（dependency-cruiser の `mocks-entry-only`）。テストも、`server`・`scenarios`・`resetMockData` を `node.ts` から読む。中の並べ方を変えても、外のコードを直さずに済む。

ts-monorepo-orpc-prac の、保管（`data.ts`）・判断（`controller.ts`）・経路（`handler.ts`）・失敗の上書き（`scenarios.ts`）に分ける考え方を持ってきた。このリポジトリでは、経路は `RPCHandler` が受け持つので書かない。判断は、API のフォルダの `handler.ts` に入る。

保管はメモリの中にした。ts-monorepo-orpc-prac は `localStorage` に置いて読み直しても消えないようにしていたが、今はまだ消えて困るデータがない。テストでは毎回空から始めたいので、`resetMockData()` で空に戻す。

### 型で守る

| 間違い                                                           | 止まる場所                                                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 約束に API を足したのに、フォルダを作り忘れる                    | `router.ts`。`os.router({...})` は約束のすべての API を求める                                   |
| 正常系やシナリオが、約束と違う形の値を返す                       | その API のファイル。`os.<API>.handler()` は約束の型を持つ                                      |
| `message/list/scenarios.ts` に、別の API（create）の実装を入れる | その `scenarios.ts`。`satisfies Record<string, typeof handler>` で、同じ API の実装だけを書ける |
| シナリオの名前を打ち間違える（`message.list.manny`）             | 使う側（テストなど）。名前は `<API>.<状態>` の型になっている                                    |

わざと間違えて、4 つとも型チェックで止まることを確かめた。

`os` は `api/router.ts` ではなく `utils/orpc-implementer.ts` に置く。`api/router.ts` に置くと、「`api/router.ts` が `handler.ts` を読み、`handler.ts` が `api/router.ts` を読む」循環参照になり、dependency-cruiser の `no-circular` に止められる。

### src/client の下に置く

MSW は FE の開発とテストのための道具なので、`src/client/mocks` に置いた。テストの準備も、client のテストのために MSW を立ち上げるものなので、`src/client/__setup__` に置いた。

最初は `src/mocks` という、`src/client` でも `src/server` でもない 3 つ目の場所に置いていた。偽物は `@orpc/server` の `implement`・`RPCHandler`・`ORPCError` を使い、`src/client` から `@orpc/server` を読むのは `client-not-to-server-modules` で止めていたため。`src/client` の下に移すときに、偽物のフォルダだけをこのルールから外した。

外しても大丈夫と考えた理由:

- 偽物が本番のバンドルに入らないことは、`client-not-to-mocks`（偽物を読めるのは `main.tsx` とテストだけ）と、`import.meta.env.DEV` の動的 import で守る。偽物の中に `@orpc/server` があっても、FE のバンドルには入らない（本番のビルドの中身で、`implement(` が 0 件だった）
- 偽物が本物の BE を読まないことは、`client-not-to-server`（`src/server`）と `mocks-not-to-db`（`void/db`）で止める

| ルール                         | 止めること                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `client-not-to-mocks`          | `src/client` から `src/client/mocks` を読む。読んでよいのは `main.tsx` とテストだけ |
| `client-not-to-server-modules` | `src/client` から `@orpc/server`・`void/db` を読む。`src/client/mocks` は外す       |
| `mocks-not-to-db`              | 偽物が本物の DB（`void/db`）を読む。偽物は約束だけを見て作る                        |
| `server-not-to-client`         | 本物の BE が偽物を読む（偽物は `src/client` の中なので、このルールで止まる）        |
| `no-test-support-in-app`       | アプリのコードが `src/client/__setup__` を読む                                      |

`no-test-runner-in-app`（アプリのコードから `vite-plus/test` を読まない）は、`src/client/__setup__` を外した。偽物の中で `vite-plus/test` を読むのは止まる。

わざと違反を入れ、7 つとも止まることを確かめた（FE の部品から偽物、BE から偽物、偽物から `~/server/rpc/router`、偽物から `void/db`、偽物の外から `@orpc/server`、アプリのコードから `~/client/__setup__`、偽物の中で `vite-plus/test`）。

わざと違反を入れ、5 つとも止まることを確かめた（FE の部品から `~/mocks`、BE から `~/mocks`、偽物から `~/server/rpc/router`、偽物から `void/db`、アプリのコードから `~/__setup__`）。

## 本番のバンドルに入れない

```ts
// src/client/main.tsx
if (import.meta.env.DEV) {
  const { startMocking } = await import("~/client/mocks/browser");
  await startMocking();
}
```

`import.meta.env.DEV` で囲み、動的 import で読む。本番のビルドでは `DEV` が `false` になり、`browser.ts` から先（MSW・偽物・シナリオ）が丸ごと消える。

本番のビルドの中身を探して確かめた。

| 探した文字列                                                          | 本番のバンドル |
| --------------------------------------------------------------------- | -------------- |
| `mockServiceWorker`・`setupWorker`・`virtual:msw`・`HttpNetworkFrame` | 0 件           |
| `startMocking`・`onUnhandledFrame`                                    | 0 件           |
| 偽物の返答（`（偽物）`）・シナリオの名前                              | 0 件           |

`mockServiceWorker.js` も出力されなかった。MSW 公式の Vite のガイドにも「本番では何もしない。Service Worker のファイルは配らず、ビルドにも書き出さない」とある（下の「Service Worker のファイルを public/ に置かない」）。

ビルドに `client/_headers` が増えていたが、Void が作るキャッシュの設定で、MSW とは関係なかった（MSW の変更を外したビルドでも出た）。

## Service Worker のファイルを public/ に置かない

MSW 2 までは、Service Worker のファイル（`mockServiceWorker.js`）を、`npx msw init public/` で `public/` にコピーしていた。MSW 3 では、Vite の plugin（`msw/vite`）が開発サーバーで配るので、コピーしなくてよい。

|                                            | ts-monorepo-orpc-prac（MSW 2.15.0）                                                                                                                  | このリポジトリ（MSW 3.0.4）                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `mockServiceWorker.js`                     | `apps/frontend/public/` に置き、コミットしている                                                                                                     | どこにもない（`apps/web/public/` もない）                 |
| 置き方                                     | `npx msw init public/` でコピーする。`package.json` の `"msw": { "workerDirectory": ["public"] }` は、`msw` を入れ直したときにコピーし直すための設定 | `vite.config.ts` の `msw()` が、入れた `msw` から直接配る |
| 開発サーバーの `GET /mockServiceWorker.js` | `public/` のファイルが配られる                                                                                                                       | 200。中身の版は `3.0.4`（入れた MSW と同じ）              |
| 本番のビルド                               | `public/` の中身なので、ビルドに入る                                                                                                                 | 出力されない                                              |

### なぜファイルが要るのか

Service Worker は、自分が置かれたパスより下の通信しか横取りできない。画面のすべての通信を横取りするには、サイトの一番上（`/mockServiceWorker.js`）から読み込む必要がある。MSW 2 は、`public/` に置けば Vite がサイトの一番上で配る、という形でこれを満たしていた。

その形には困ることがあった。

- コピーが古くなる。`msw` を上げても `public/` のファイルは更新されず、版が合わないと MSW が警告を出す。`workerDirectory` は、これを防ぐための設定だった
- リポジトリに、数百行の生成されたファイルが入る

MSW 3 の Vite の plugin は、`node_modules` の中の `msw` から配るので、いつも入れた版と同じファイルになる。コピーもコミットも要らない。

### Vite の plugin を使わないとき

これは Vite の plugin を使うときの話。Vite を使わずにブラウザで MSW を動かすときや、plugin を `mode: "worker-only"`（Service Worker のファイルだけを配り、`virtual:msw` を使わず `setupWorker` で自分で組む）で使うときは、`setupWorker` を使う。MSW 公式のブラウザの手順のページ（Browser integration）は、2026-11-08 の時点でも `npx msw init <PUBLIC_DIR> --save` の手順だけを書いていて、Vite の plugin には触れていない。Vite で組むときは、Vite のガイドの方を読む。

### 公式の docs

| ページ                                                                                                 | 書いてあること                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Migrating from 2.x to 3.x の「Vite plugin」](https://mswjs.io/docs/migrations/2.x-to-3.x#vite-plugin) | 「The plugin serves the worker script for you, so you no longer have to copy the `mockServiceWorker.js` script into your public directory.」                                                                                                                                                                                                                                                      |
| [Vite integration](https://mswjs.io/guides/integrations/vite)                                          | 開発中は `/mockServiceWorker.js` で配る（`base` に従う）。入れた `msw` から直接配るので、コピーも更新も要らない。本番では何もせず、Service Worker のファイルは配らず書き出さない。`import.meta.env.DEV` で囲む。MSW 2 から移るときは、`public/mockServiceWorker.js` を消して、`setupWorker()`・`worker.start()` を `virtual:msw` の `network` に置き換える。`mode`（`"auto"` か `"worker-only"`） |
| [Browser integration](https://mswjs.io/docs/integrations/browser)                                      | `npx msw init <PUBLIC_DIR> --save` で `public/` にコピーする手順（Vite の plugin を使わないとき）                                                                                                                                                                                                                                                                                                 |

## 失敗の画面を見る（?scenario=）

```text
http://localhost:5173/?scenario=message.create.error
```

ts-monorepo-orpc-prac と同じ形。MSW 公式の「Dynamic mock scenarios」に沿っている。正常系は書き換えず、選ばれたシナリオを前に差し込む（MSW は前のハンドラを優先する）。URL で選べるシナリオは 1 つだけ。組み合わせたい状態があれば、その組み合わせを 1 つのシナリオとして書く。

### シナリオの書き方

シナリオは、MSW のハンドラではなく、その API の実装として書く。MSW のハンドラに包むのは `scenarios.ts` が受け持つ。

```ts
// src/client/mocks/api/message/create/scenarios.ts
export const scenarios = {
  error: os.message.create.handler(() => {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "メッセージを保存できませんでした" });
  }),
} satisfies Record<string, typeof handler>;
```

```ts
// src/client/mocks/api/scenarios.ts
export const scenarios = {
  ...named("message.list", messageList, (list) => ({ message: { list } })),
  ...named("message.create", messageCreate, (create) => ({ message: { create } })),
  ...named("chat.stream", chatStream, (stream) => ({ chat: { stream } })),
};
```

- `named` が、状態の名前（`error`）に API を付けて、`message.create.error` にする。別の API で同じ `error` を使っても重ならない。ts-monorepo-orpc-prac は、名前の重なりを型で見つける工夫（`UniqueNames`）が要ったが、ここでは名前の作り方で重ならない
- シナリオの router は、上書きしたい API だけを持つ。router にない API は `RPCHandler` が `matched: false` を返し、MSW が次のハンドラ（正常系）に回す
- 失敗は、どれも約束に定義のない 500（`INTERNAL_SERVER_ERROR`）。エラーの種類を約束に書く（oRPC の `.errors()`）のは、本物の画面でエラーを出し分けるときに、約束・本物の BE と一緒にやる

| シナリオ               | 画面での動き                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `message.list.many`    | 一覧に 30 件                                                 |
| `message.list.error`   | 一覧の取得が 500                                             |
| `message.create.error` | 一覧の取得は 200、作成だけ 500                               |
| `chat.stream.slow`     | 1 文字ずつ 150 ms。0.7 秒後は「（偽物）」まで、全部で 2.8 秒 |
| `chat.stream.error`    | 「（偽物）「」まで届いてから切れる                           |
| `nope`（知らない名前） | 正常系で動き、使える名前の一覧をコンソールに出す             |

### ハンドラにない通信

Service Worker は、画面のファイルの取得も通る。`onUnhandledFrame` で、`/rpc` の書き忘れだけを `warn` にし、ほかは何もしない（`bypass` と同じ）。MSW 3 では、`onUnhandledRequest` が `onUnhandledFrame` に名前が変わり、引数も `({ frame, defaults })` になった。`virtual:msw` の `network.enable()` は引数を取らないので、`network.configure({ handlers, onUnhandledFrame })` で渡す。

## 単体テストから使う

`client` のプロジェクトの `setupFiles` に `src/client/__setup__/setup.ts` を足した。

```ts
// src/client/__setup__/setup.ts
server.listen({ onUnhandledFrame: "error" });

afterEach(() => {
  server.resetHandlers();
  resetMockData();
});

afterAll(() => server.close());
```

- `server.listen()` は `beforeAll` ではなく、読み込んだ時点で呼ぶ。テストのファイルが読む `orpc.ts` の `RPCLink` は、作られたときの `fetch` を覚える。テストのファイルの import は `beforeAll` より先に動くので、`beforeAll` で MSW が `fetch` を差し替えても、`RPCLink` は古い `fetch` を使い続ける（design-system-prac の docs/20 で見つけた落とし穴）
- `onUnhandledFrame: "error"` で、偽物にない通信をしたテストは落ちる
- テストごとに、`server.use()` の上書きと、偽物の保管を元に戻す
- `src/client/__setup__` は `tsconfig.test.json` で見る（`globals` の型を使うため）。`tsconfig.app.json` からは外す

テストで失敗を試すときは、画面と同じシナリオを使う。

```ts
server.use(scenarios["message.create.error"]);
```

`src/client/__tests__/orpc.test.ts` で、正常系（作成と一覧、テストごとに空に戻ること、ストリーミング）と、シナリオ（`message.list.many`・`message.list.error`・`message.create.error`・`chat.stream.error`、上書きしていない API が正常系のまま動くこと）を確かめた。`chat.stream.slow` は待つだけなので、画面で確かめた。

`server` のプロジェクトには、MSW を入れていない。いずれ BE から外の API（Claude の API など）を呼ぶようになったら、その呼び出しを `msw/node` で偽物にできる。

## peer の食い違いを 1 組だけ許す

MSW を入れたあと、`pnpm peers check` が食い違いを出した。

```text
✕ unmet peer msw
  Installed: 3.0.4
  Wanted:
    2.14.6:
      @cloudflare/workers-auth@0.15.6
```

`void` が使う `@cloudflare/workers-auth` は、`msw` 2.14.6 を optional の peer に持つ。`msw` を使っているのは、Cloudflare 自身のテスト用の道具（`dist/test-helpers/`）だけで、本体のコードは使わない。`void` が読むのは `@cloudflare/workers-auth` と `@cloudflare/workers-auth/cf`（デプロイのときのログイン）で、`test-helpers` は読まない。MSW を入れる前は optional の peer がなくてもよかったが、3.0.4 を入れたことで pnpm がつなぎ、版の食い違いになった。

`oxc-transform-react` のとき（docs/01）は版を下げて合わせたが、今回は合わせられない。MSW を 2 に戻すと、MSW 3 の Vite の plugin が使えない。そこで、`pnpm-workspace.yaml` の `peerDependencyRules.allowedVersions` に `"@cloudflare/workers-auth>msw": "3"` を足し、この 1 組だけを許した。ほかのパッケージの peer の食い違いは、今までどおり見つかる。

## 最初の読み込みで 1 回だけ読み直された

MSW を入れた直後、開発サーバーで最初に画面を開いたとき、`Failed to fetch dynamically imported module: /src/mocks/browser.ts` と `504 (Outdated Optimize Dep)` が出て、画面が 1 回読み直された。読み直したあとは動いた。

MSW を入れる前の、Vite の前処理の結果（`apps/web/node_modules/.vite/`）が残っていたため。Vite は、開発中に初めて見つけた依存（`msw`・`@orpc/server`）をその場で前処理し直し、読み込み途中のファイルを古いと判断する。前処理の結果を消して起動すると、Vite が起動したときに `main.tsx` から動的 import の先までたどって `msw` を先に見つけるので、エラーは出なかった。

依存を足した直後の 1 回だけなので、`optimizeDeps.include` は足していない。
