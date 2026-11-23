---
status: accepted
date: 2026-11-23
scope: server
decision-makers: zui
consulted: Claude
informed:
---

# ほかのサイトからの書き込みはオリジンを見て弾く

## 背景と課題 (Context and Problem Statement)

ログインはクッキーで覚える（ライブラリ関連/ADR-04）。ブラウザは、ほかのサイトのページから送られたリクエストにもクッキーを付けることがある。なので、ほかのサイトのページが、ログイン中の人の代わりに、会話を消したりメッセージを送ったりできないようにする（CSRF）。

読むだけの手続きは `GET`、書き込む手続きは `POST`・`DELETE`・`PATCH` で送る（ADR-01）。`GET` で書き込めないことは、oRPC が守る（`GET` の印を付けた手続きだけを `GET` で呼べる）。残るのは、ほかのサイトからの `POST`・`DELETE`・`PATCH` をどこで弾くか。

## 決定要因 (Decision Drivers)

- どの手続きにも、書き忘れなく効くこと
- FE に、守りのためのコードを足さずに済むこと
- oRPC を v2 に上げても、そのまま使えること
- 守りが 1 枚だけにならないこと

## 検討した選択肢 (Considered Options)

- `/rpc` の受け口で、ブラウザが付けるヘッダー（`Sec-Fetch-Site`・`Origin`）を見て弾く
- oRPC の `SimpleCsrfProtectionHandlerPlugin` を使う
- 認証の守り（クッキーの `SameSite` など）だけに任せる

## 決定 (Decision Outcome)

**選択: `/rpc` の受け口で、ブラウザが付けるヘッダーを見て弾く**

決め手は、**ブラウザが付けるヘッダーだけで見分けられるので FE に何も足さず、受け口の 1 か所でどの手続きにも効く**こと。

- `GET` 以外のリクエストは、oRPC に渡す前に確かめる。`HEAD` は受けずに断る
- `Sec-Fetch-Site` があれば、`same-origin`（同じオリジンのページから）と `none`（人の操作から）だけを通す
- `Sec-Fetch-Site` が無ければ `Origin` を見て、リクエストの宛先と同じオリジンだけを通す
- どちらのヘッダーも無ければ通す。ブラウザでないクライアントで、クッキーを勝手に付けて送ることがない
- 弾くときは 403 を返し、手続きを実行しない
- 認証の守りは、これと別にそのまま使う

### 結果 (Consequences)

- Good, because 手続きを足しても、守りを書き足さずに済む
- Good, because FE は何もしない。ヘッダーはブラウザが付け、ページのスクリプトからは書き換えられない
- Good, because 認証の守りと合わせて 2 枚になる
- Bad, because 別のオリジンに置いた画面から、この API を呼べなくなる。そうするときは、通すオリジンを決めて足す
- Neutral, because 受け口の 1 か所で守るので、API は `/rpc` の受け口だけに置く（ADR-01）

### 確認方法 (Confirmation)

ほかのサイトからの `POST`・`DELETE` が 403 になり、手続きが実行されないこと、同じオリジンからの書き込みと、ヘッダーの無い書き込みが通ることを、テストで確かめる。

## 各選択肢の評価 (Pros and Cons of the Options)

### `/rpc` の受け口で、ブラウザが付けるヘッダーを見て弾く — 採用

- Good, because トークンを配ったり、覚えたりしなくてよい
- Good, because oRPC の版に頼らない
- Neutral, because `Sec-Fetch-Site` を付けない古いブラウザでは、`Origin` で見る

### oRPC の `SimpleCsrfProtectionHandlerPlugin` を使う

- Good, because oRPC に入っていて、設定だけで使える
- Bad, because 決まったヘッダー（`x-csrf-token: orpc`）があるかを見る仕組みなので、FE にも対のプラグインを入れて、ヘッダーを付ける必要がある
- Bad, because v2 で無くなる

### 認証の守りだけに任せる

- Good, because 何も作らない
- Bad, because 守りが 1 枚になり、クッキーの設定を変えたときに気づかず外れることがある
- Bad, because ログインを作る前は、弾かれることをテストで確かめられない
