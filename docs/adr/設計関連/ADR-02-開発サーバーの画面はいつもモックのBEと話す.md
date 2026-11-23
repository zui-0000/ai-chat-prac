---
status: accepted
date: 2026-11-08
scope: client
decision-makers: zui
consulted: Claude
informed:
---

# 開発サーバーの画面はいつもモックの BE と話す

## 背景と課題 (Context and Problem Statement)

`vp run dev` では本物の BE（workerd とローカルの D1）も立ち上がる。でも画面を作るときは、失敗やストリーミングの途中などの状態を、自由に出したい。

モックを API ごとに生の MSW で書くと、oRPC の通信の形を手で真似ることになる。契約とずれても気づけず、「モックでは動くのに、本物で壊れる」が起きる。

## 決定要因 (Decision Drivers)

- 画面で、失敗などの状態を自由に出せること
- モックが契約（ADR-01）とずれたら気づけること
- モックを本番のバンドルに入れないこと

## 検討した選択肢 (Considered Options)

- いつもモックと話す。モックは MSW の中で oRPC を動かして作る
- API ごとに生の MSW でモックを書く
- URL や環境変数で、モックと本物を切り替える

あわせて、Service Worker の配り方について次の案も比べた。

- `npx msw init` で Service Worker を `public/` にコピーする（配り方の案）

## 決定 (Decision Outcome)

**選択: いつもモックと話す。モックは MSW の中で oRPC を動かして作る**

決め手は、**モックも契約を `implement` するので、契約とずれると型エラーになる**こと。

- 画面の oRPC のクライアントは本物のまま、ブラウザの MSW の中で oRPC の受け口を動かして、BE の側をモックにする。モックは `apps/web/src/client/mocks/` に置く
- 本物の BE は、`vp run build` してから `vp run preview` で見る
- 失敗などの状態は、URL の `?scenario=<API>.<状態>` で 1 つ選ぶ。単体テストでも同じシナリオを使う
- Service Worker のファイルは、MSW 3 の Vite の plugin が、入れた `msw` から配る。`public/` に置かず、コミットもしない
- モックは開発のときだけ動的 import で読み、本番のバンドルに入れない

### 結果 (Consequences)

- Good, because 契約とずれたモックは、型エラーで止まる
- Good, because 画面とテストで、同じシナリオを使える
- Bad, because 開発サーバーの画面から、本物の BE は確かめられない
- Bad, because モックの中でだけ、BE のライブラリ（`@orpc/server`）を読むのを許した

### 確認方法 (Confirmation)

`vp run build` の出力に、モック（`mocks/`）のコードが入っていないこと。

## 各選択肢の評価 (Pros and Cons of the Options)

### いつもモックと話す。モックは MSW の中で oRPC を動かして作る — 採用

- Good, because モックが契約を守る
- Good, because ストリーミングも、本物と同じ oRPC の仕組みで流れる
- Bad, because tsconfig が DOM と Workers の両方の型を読むので、MSW から受け口に渡す `Request` の型を合わせる手間がある

### API ごとに生の MSW でモックを書く

- Good, because MSW のふつうの書き方で、情報が多い
- Bad, because oRPC の通信の形を手で真似ることになり、契約とずれても気づけない
- Bad, because ストリーミングを手で組み、oRPC の版が上がるとモックだけ壊れる

### URL や環境変数で、モックと本物を切り替える

- Good, because 開発サーバーの画面から本物も見られる
- Bad, because どちらと話しているかが、画面によって変わる

### `npx msw init` で Service Worker を `public/` にコピーする（配り方の案）

- Good, because MSW の公式のブラウザの手順どおり
- Bad, because コピーが古くなり、生成された数百行のファイルがリポジトリに入る
