---
status: accepted
date: 2026-11-23
scope: contract
decision-makers: zui
consulted: Claude
informed:
---

# 契約のスキーマに valibot を採用

## 背景と課題 (Context and Problem Statement)

契約（`packages/contract`。設計関連/ADR-01）の入力と出力の形は、スキーマのライブラリで書く。最初は zod で書いていた。oRPC は Standard Schema に対応しているので、契約の作り（`.input()`・`.output()`・`.errors()`）を変えずに、ライブラリだけを差し替えられる。

どの手続きにも共通の形（ID・日時・エラー）を書く前に、どちらで書くかを決める。共通の形を書いたあとに変えると、書き直す量が増える。

## 決定要因 (Decision Drivers)

- BE が動く Cloudflare Workers で遅くならないこと
- Worker の起動のたびにかかる、スキーマを作る時間が短いこと
- 契約を FE で読んでも、バンドルが大きくならないこと
- 更新が続いていること

## 検討した選択肢 (Considered Options)

- valibot
- zod

## 決定 (Decision Outcome)

**選択: valibot**

決め手は、**Workers では zod より速く、スキーマを作る時間とバンドルが 1 桁小さく、契約がまだ小さい今なら書き換えが安い**こと。

- 契約のスキーマは valibot で書く。`import * as v from "valibot"` で読む
- zod を契約の依存から外す

### 結果 (Consequences)

- Good, because Workers での検査が 1.3〜1.5 倍速い（下の計測）
- Good, because スキーマを作る時間が 12 分の 1 になる
- Good, because FE が契約の値を読んでも、FE のバンドルは gzip で 1.6 KB しか増えない（設計関連/ADR-01 の補足）
- Bad, because BE のバンドルから zod は消えない。認証の Better Auth（ADR-04）が zod に依存している。valibot の分が足される
- Bad, because zod にある `z.uuidv7()` が無く、UUIDv7 の検査は正規表現で書く
- Bad, because スキーマを JSON Schema にするときは、別のパッケージ（`@valibot/to-json-schema`）が要る。zod は本体に入っている
- Neutral, because 1 回の検査はどちらも 30 µs より短い。AI の返答を待つ時間に比べると小さく、速さだけなら決め手にならない

### 確認方法 (Confirmation)

- 契約の依存（`packages/contract/package.json`）に zod が無いこと
- 契約から手続きを 1 つ消すと、BE と偽物の BE の両方が型エラーになること（設計関連/ADR-01 と同じ）

## 各選択肢の評価 (Pros and Cons of the Options)

同じ形（メッセージ 50 件を持つ会話と、送信の入力。UUIDv7 と `Date` を含む）を両方で書いて測った。Node.js 26、zod 4.6.7、valibot 1.5.0。

| 測ったもの                       | zod          | valibot      |
| -------------------------------- | ------------ | ------------ |
| 会話の検査（Workers と同じ条件） | 33,356 回/秒 | 44,510 回/秒 |
| 入力の検査（Workers と同じ条件） | 335 万回/秒  | 513 万回/秒  |
| 会話の検査（Node.js）            | 80,835 回/秒 | 45,958 回/秒 |
| スキーマを作る時間               | 42 µs        | 3.3 µs       |
| バンドル（gzip）                 | 25.5 KB      | 1.8 KB       |

zod 4 は、実行時にコードを作って検査を速くする。Cloudflare Workers はそれを許さないので、zod は自分で Cloudflare を見分けて、コードを作らない道に切り替える。「Workers と同じ条件」は、その道（`jitless`）で測った値。

### valibot — 採用

- Good, because Workers と同じ条件で、会話の検査が 1.3 倍、入力の検査が 1.5 倍速い
- Good, because 検査が 1 つずつ別の関数なので、使わないものがバンドルに入らない
- Good, because 1.x が続いていて、2〜4 か月ごとに新しい版が出ている
- Bad, because `v.pipe()` の書き方は、zod のメソッドをつなぐ書き方より長い
- Bad, because zod より情報が少ない

### zod

- Good, because 情報が多く、書き方が短い
- Good, because `z.uuidv7()` や JSON Schema への変換が本体に入っている
- Good, because Node.js では、会話の検査が valibot の 1.8 倍速い
- Bad, because Workers では、速くする仕組みが使えず、valibot より遅い
- Bad, because メソッドをつなぐ作りなので、使わない検査もバンドルに入る

## 補足情報 (More Information)

### この決定が変わりうるとき

- valibot で書けない検査が要るようになったとき
- Workers で、zod の速くする仕組みが使えるようになったとき
