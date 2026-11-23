---
status: accepted
date: 2026-11-23
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# 識別子は UUIDv7 とし公開 ID も兼ねる

## 背景と課題 (Context and Problem Statement)

会話やメッセージの ID は、DB の主キーになり、URL（`/chats/$chatId`）と API の入出力にも出る。どの手続きの約束も ID を使うので、形を先に決める。

疎通確認用に作った最初のテーブルは、連番の整数を主キーにしていた。連番を URL に出すと、件数が分かり、隣の番号を試せる。

## 決定要因 (Decision Drivers)

- ID を 1 つ知っても、ほかの ID を当てられないこと
- ID から件数が分からないこと
- 主キーとして、行を足すときに索引が散らからないこと
- 主キーと別に、外に出す ID の列を持たずに済むこと

## 検討した選択肢 (Considered Options)

- UUIDv7
- UUIDv4
- 連番の整数

## 決定 (Decision Outcome)

**選択: UUIDv7**

決め手は、**当てられず、件数も分からないうえに、時刻の順に並ぶので、行を足すときに索引の末尾に入る**こと。

- 主キーと外に出す ID を、同じ列で兼ねる
- BE が `uuid` の `v7()` で作る。DB には `text` の列で入れる
- 約束では `IdSchema`（`packages/contract`）で検査する。小文字の UUIDv7 だけを通す

### 結果 (Consequences)

- Good, because ID を URL に出しても、件数が分からず、隣の ID を試せない
- Good, because 新しい行が索引の末尾に入る
- Good, because 外に出す ID の列を別に持たない
- Bad, because ID から作った時刻（ミリ秒）が分かる。会話とメッセージは作った日時を API で返すので、引き受ける
- Bad, because 整数より長く、DB と URL で場所を取る

### 確認方法 (Confirmation)

BE が作った ID が `IdSchema` を通ることを、ID を作る実装と一緒に、テストで確かめる。

## 各選択肢の評価 (Pros and Cons of the Options)

### UUIDv7 — 採用

- Good, because 先頭が時刻なので、作った順に並ぶ
- Good, because 時刻のあとは乱数なので、当てられない
- Bad, because 作った時刻が分かる

### UUIDv4

- Good, because 全体が乱数で、時刻も順番も分からない
- Bad, because 行を足す場所が毎回ばらばらになり、索引が散らかる

### 連番の整数

- Good, because 短く、DB が作ってくれる
- Bad, because 件数が分かり、隣の番号を試せる
- Bad, because 外に出さないなら、外に出す ID の列が別に要る

## 補足情報 (More Information)

### この決定が変わりうるとき

作った時刻を知られたくないものに ID を付けるとき。そのときは、その ID だけ UUIDv4 にするか、外に出す ID を別に持つ。
