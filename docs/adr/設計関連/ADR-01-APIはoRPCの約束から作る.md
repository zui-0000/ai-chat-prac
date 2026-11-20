---
status: accepted
date: 2026-11-08
scope: contract
decision-makers: zui
consulted: Claude
informed:
---

# API は oRPC の約束から作る

## 背景と課題 (Context and Problem Statement)

Void（ライブラリ関連/ADR-01）の型安全はコード駆動で、型は DB のスキーマ → ハンドラーが返す値 → Void が作るルートの型 → `void/client` の `fetch` の順に流れる。入力と出力の形を先に書く場所が無いので、BE のルートを書くまで、FE と偽物の BE を作れない。

AI チャットでは、さらに次のことが効いた。

- Void のストリーミングのクライアント（`void/sse/client`）は `EventSource` を包んだもので、リクエストの body を送れない。メッセージを送って、返答を流して受け取る、が組めない
- 偽物の BE（ADR-02）が満たすべき約束が無いと、偽物と本物の形がずれても気づけない

## 決定要因 (Decision Drivers)

- 入力と出力の形を、BE より先に書けること
- body を送って、返答を流して受け取れること
- 偽物の BE も同じ形を守ること
- FE のバンドルに、サーバーのコードやスキーマを入れないこと

## 検討した選択肢 (Considered Options)

- oRPC の約束を先に書く
- Void の `void/client` の `fetch`

あわせて、約束の中身について次の案も比べた。

- 全部の手続きを `POST` にする（メソッドの案）
- oRPC v2 のベータを今使う（版の案）

## 決定 (Decision Outcome)

**選択: oRPC の約束を先に書く**

決め手は、**BE と偽物の BE が約束を `implement` し、FE は約束の型でクライアントを作るので、形がずれると型エラーになる**こと。`eventIterator` で、body を送って返答を流して受け取れることも試して確かめた。

- FE と BE の間の API は、`packages/contract` に oRPC の約束（zod のスキーマ）として先に書く
- BE は Void のルートを 1 つ（`/rpc` の受け口）だけ置き、`/rpc` の下は全部 oRPC に渡す
- FE は約束の型だけを読み、関数のように呼ぶ
- HTTP のメソッドは、動き（読む・消す・作る）に合わせる
- 手続きを増やさない。止める・送り直す・ログイン中の人を知る、は手続きを作らずに済ませる
- oRPC は v1 で作り、v2 の正式版が出たら移る。v1 のうちから、v2 で無くなる書き方（エラーの `status` など）を使わない

### 結果 (Consequences)

- Good, because 約束を先に書けば、FE・偽物の BE・本物の BE を並べて作れる
- Good, because FE のバンドルに、サーバーのコードも zod も入らない（約束の型だけを読む）
- Good, because 約束に無い入力は 400、約束に無い URL は 404 になる
- Bad, because Void の公式の道から少し外れる。`/rpc` の下は、Void の型付き `fetch` とルートごとのキャッシュの対象から外れる
- Bad, because v2 に移るときに書き方が変わり、FE と BE を同時に上げることになる

### 確認方法 (Confirmation)

- 約束から手続きを 1 つ消すと、BE と偽物の BE の両方が型エラーになること
- `vp run lint:deps` が、FE から BE のコードを読むのを止めること

## 各選択肢の評価 (Pros and Cons of the Options)

### oRPC の約束を先に書く — 採用

- Good, because 約束が FE・BE・偽物の BE の共通の約束になる
- Good, because TanStack Query の道具があり、キーを自分で持たずに済む
- Bad, because Void の docs に載せ方が無く、受け口を自分で組む

### Void の `void/client` の `fetch`

- Good, because Void の公式の道で、型付きの `fetch` とルートごとのキャッシュが使える
- Bad, because ストリーミングのクライアントが body を送れない
- Bad, because 偽物の BE が満たす約束が無い
- Bad, because TanStack Query のキーを自分で持つことになる

### 全部の手続きを `POST` にする（メソッドの案）

- Good, because oRPC の既定で、設定が要らない
- Bad, because 通信を見ても、読むのか書くのか分からない

### oRPC v2 のベータを今使う（版の案）

- Good, because 移る手間が無くなる
- Bad, because 上げるたびに中身が変わり、固定の版で入れるやり方と合わない
