---
status: accepted
date: 2026-11-08
scope: contract
decision-makers: zui
consulted: Claude
informed:
---

# API は oRPC の契約から作る

## 背景と課題 (Context and Problem Statement)

Void（ライブラリ関連/ADR-01）の型安全はコード駆動で、型は DB のスキーマ → ハンドラーが返す値 → Void が作るルートの型 → `void/client` の `fetch` の順に流れる。入力と出力の形を先に書く場所が無いので、BE のルートを書くまで、FE と偽物の BE を作れない。

AI チャットでは、さらに次のことが効いた。

- Void のストリーミングのクライアント（`void/sse/client`）は `EventSource` を包んだもので、リクエストの body を送れない。メッセージを送って、返答を流して受け取る、が組めない
- 偽物の BE（ADR-02）が満たすべき契約が無いと、偽物と本物の形がずれても気づけない

## 決定要因 (Decision Drivers)

- 入力と出力の形を、BE より先に書けること
- body を送って、返答を流して受け取れること
- 偽物の BE も同じ形を守ること
- FE のバンドルに、サーバーのコードやスキーマを入れないこと

## 検討した選択肢 (Considered Options)

- oRPC の契約を先に書く
- Void の `void/client` の `fetch`

あわせて、契約の中身について次の案も比べた。

- 全部の手続きを `POST` にする（メソッドの案）
- oRPC v2 のベータを今使う（版の案）

## 決定 (Decision Outcome)

**選択: oRPC の契約を先に書く**

決め手は、**BE と偽物の BE が契約を `implement` し、FE は契約の型でクライアントを作るので、形がずれると型エラーになる**こと。`eventIterator` で、body を送って返答を流して受け取れることも試して確かめた。

- FE と BE の間の API は、`packages/contract` に oRPC の契約（valibot のスキーマ。ライブラリ関連/ADR-05）として先に書く
- BE は Void のルートを 1 つ（`/rpc` の受け口）だけ置き、`/rpc` の下は全部 oRPC に渡す
- FE は契約からクライアントを作り、関数のように呼ぶ
- HTTP のメソッドは、動き（読む・消す・作る）に合わせる
- 手続きを増やさない。止める・送り直す・ログイン中の人を知る、は手続きを作らずに済ませる
- oRPC は v1 で作り、v2 の正式版が出たら移る。v1 のうちから、v2 で無くなる書き方（エラーの `status` など）を使わない

### 結果 (Consequences)

- Good, because 契約を先に書けば、FE・偽物の BE・本物の BE を並べて作れる
- Good, because FE のバンドルに、サーバーのコードが入らない（FE が読むのは契約だけ）
- Good, because 契約に無い入力は 400、契約に無い URL は 404 になる
- Bad, because Void の公式の道から少し外れる。`/rpc` の下は、Void の型付き `fetch` とルートごとのキャッシュの対象から外れる
- Bad, because v2 に移るときに書き方が変わり、FE と BE を同時に上げることになる

### 確認方法 (Confirmation)

- 契約から手続きを 1 つ消すと、BE と偽物の BE の両方が型エラーになること
- `vp run lint:deps` が、FE から BE のコードを読むのを止めること

## 各選択肢の評価 (Pros and Cons of the Options)

### oRPC の契約を先に書く — 採用

- Good, because 契約が FE・BE・偽物の BE の共通の契約になる
- Good, because TanStack Query の道具があり、キーを自分で持たずに済む
- Bad, because Void の docs に載せ方が無く、受け口を自分で組む

### Void の `void/client` の `fetch`

- Good, because Void の公式の道で、型付きの `fetch` とルートごとのキャッシュが使える
- Bad, because ストリーミングのクライアントが body を送れない
- Bad, because 偽物の BE が満たす契約が無い
- Bad, because TanStack Query のキーを自分で持つことになる

### 全部の手続きを `POST` にする（メソッドの案）

- Good, because oRPC の既定で、設定が要らない
- Bad, because 通信を見ても、読むのか書くのか分からない

### oRPC v2 のベータを今使う（版の案）

- Good, because 移る手間が無くなる
- Bad, because 上げるたびに中身が変わり、固定の版で入れるやり方と合わない

## 補足情報 (More Information)

### エラーの形（2026-11-23 に追記）

- エラーは、契約の `.errors()` に書く。種類は、契約に書いたキーの名前（`UNAUTHORIZED`・`NOT_FOUND`・`BAD_REQUEST`・`AI_FAILED`）で見分ける。番号は別に持たない
- エラーが持つのはメッセージと、要るときの追加の情報だけ。`status` は持たせない。HTTP の状態コードは、oRPC がキーの名前から決める。v2 では、契約のエラーから `status` が無くなる
- 未ログインと入力の誤りのエラーは、どの手続きにも書く。手続きごとのエラー（見つからない・AI の失敗）は、要る手続きに書く
- 入力の誤りは、契約の `BAD_REQUEST` に作り直して返す。返すのは、不正だったフィールドの名前だけ
  - oRPC がそのまま返す入力のエラーには、送られた値と、検査の正規表現が入る。パスワードのような値を送る手続きで、そのまま返したくない
  - 作り直すミドルウェアは、本物の BE と偽物の BE の両方の土台に入れる。oRPC は、土台に足したミドルウェアのあとで入力を検査するので、エラーをそこで捕まえられる

### メソッドの送り方（2026-11-23 に追記）

- メソッドは、契約の手続きに書く。書かない手続きは `POST` になる
- FE は、契約の値を読んで、手続きごとのメソッドを決める（`inferRPCMethodFromContractRouter`）
- `GET` と書いていない手続きを `GET` で呼ぶと、oRPC が弾く。ほかのサイトからの `POST`・`DELETE` の守りは ADR-06

### FE が契約の値を読むことにした（2026-11-23 に追記）

決定要因の「FE のバンドルに、サーバーのコードやスキーマを入れないこと」のうち、スキーマの部分を外した。サーバーのコードを入れないことは、そのまま守る。最初は、契約を型だけで読んで、スキーマのライブラリを FE のバンドルに入れないようにしていた。

- この決定要因は、スキーマを zod で書いていたときの大きさ（gzip で約 25 KB）が前提だった
- スキーマを valibot に変えた（ライブラリ関連/ADR-05）あとは、契約の値を読んでも、FE のバンドルは gzip で 1.6 KB しか増えない（13.71 KB → 15.33 KB）
- メソッドを決めるために、契約から手続きの情報だけを残した JSON を作って FE に読ませる案（oRPC の `minifyContractRouter`）も試した。作り直しを忘れると、足した手続きが呼べなくなる。1.6 KB のために持つ仕組みではないので、やめた
