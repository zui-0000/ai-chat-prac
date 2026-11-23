---
status: accepted
date: 2026-11-23
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# 日時は Date で運び DB には UNIX ミリ秒で持つ

## 背景と課題 (Context and Problem Statement)

作った日時や更新した日時は、DB の列になり、API の出力にも出る。DB の D1（SQLite）には日時の型が無く、文字列か整数で持つ。API で返す形と、DB との間でどう変えるかを、手続きを作る前に決める。

疎通確認用に作った最初のテーブルは、SQLite の `datetime('now')` の文字列（`2026-11-23 06:00:00`）を入れていた。この文字列にはタイムゾーンが無く、ブラウザの `new Date()` に渡すと、UTC ではなく、その場所の時刻として読まれることがある。

## 決定要因 (Decision Drivers)

- FE と BE の間で、時刻がずれないこと
- DB・BE・FE の間に、変換のコードを書かずに済むこと
- 並べ替えと比較が、DB でそのままできること
- 認証のテーブル（ライブラリ関連/ADR-04）と、同じ扱いにできること

## 検討した選択肢 (Considered Options)

- `Date` で運び、DB には UNIX ミリ秒の整数で持つ
- ISO 8601 の文字列で運び、DB にも文字列で持つ

## 決定 (Decision Outcome)

**選択: `Date` で運び、DB には UNIX ミリ秒の整数で持つ**

決め手は、**DB から FE まで `Date` のまま届き、変換のコードがどこにも要らない**こと。

- 契約では `DateTimeSchema`（`packages/contract`。`Date`）で書く
- DB の列は `integer` にし、drizzle の `mode: "timestamp_ms"` で読み書きする。BE のコードでは `Date` になる
- oRPC の RPC の通信は、`Date` を `Date` のまま運ぶ。FE は文字列から作り直さない

### 結果 (Consequences)

- Good, because UNIX ミリ秒は UTC の 1 つの瞬間を表すので、タイムゾーンで時刻がずれない
- Good, because 整数なので、DB で並べ替えと比較がそのままできる
- Good, because 認証のテーブルの日時も `Date` で、同じ扱いになる
- Bad, because DB を直接見たときに、数字のままでは日時が読めない
- Bad, because oRPC の RPC の通信に頼っている。RPC でないクライアント（`curl` など）には、oRPC の形で届く

### 確認方法 (Confirmation)

日時を返す手続きの出力を、FE で `instanceof Date` で確かめる。最初に日時を返す手続きを作るときに、テストに足す。

## 各選択肢の評価 (Pros and Cons of the Options)

### `Date` で運び、DB には UNIX ミリ秒の整数で持つ — 採用

- Good, because 変換のコードが要らない
- Good, because ミリ秒まで持てる
- Bad, because DB の中身が人には読みにくい

### ISO 8601 の文字列で運び、DB にも文字列で持つ

- Good, because DB の中身も通信も、人が読める
- Good, because RPC でないクライアントからも、そのまま読める
- Bad, because FE で `new Date()` に渡す変換が、使う場所ごとに要る
- Bad, because タイムゾーンを付け忘れた文字列が混ざると、時刻がずれる。SQLite の `datetime('now')` は付けない
