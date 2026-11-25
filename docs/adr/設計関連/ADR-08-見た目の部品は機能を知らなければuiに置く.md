---
status: accepted
date: 2026-11-25
scope: client
decision-makers: zui
consulted: Claude
informed:
---

# 見た目の部品は機能を知らなければ ui に置く

## 背景と課題 (Context and Problem Statement)

ADR-03 では、Generative UI の部品をチャットの機能の中（`features/Chat/GenUI/`）に置くとした。部品の置き場所を「いくつの機能が使うか」で決めていたため、1 つの機能でしか使わない部品は `features/` に入る。

棒グラフ・選択肢・メッセージの吹き出し・コードの箱は、使うのがチャットだけでも、中身は見た目だけの部品である。これらが `features/Chat/` に入ると、Storybook と、エージェントが部品を引く MCP の `UI/` に並ばず、探しにくい。この ADR は、ADR-03 のうち置き場所の行を置き換える。カタログ型にするという ADR-03 の決定は変えない。

## 決定要因 (Decision Drivers)

- 見た目の部品を、Storybook と MCP の 1 か所で探せること
- `features/Chat/` を、部品を組み立てる場所に絞ること
- 見た目の部品が、API の形（契約）に引きずられないこと

## 検討した選択肢 (Considered Options)

- 使う機能の数で決める（これまで）
- 特定の機能を知っているかで決める

## 決定 (Decision Outcome)

**選択: 特定の機能を知っているかで決める**

決め手は、**見た目の部品が、使う機能の数に関係なく `UI/` にそろい、Storybook と MCP で探せる**こと。

- 特定の機能も契約（`@ai-chat/contract`）も知らない見た目の部品は、使う機能が 1 つだけ（チャットだけ、など）でも `components/ui/` に置く
- `ui/` の部品は、props の型を自分で持つ。契約の型を import しない
- 契約の形を `ui/` の props に詰め替える薄い部品、道具の名前から部品を選ぶカタログ、呼んでいる途中・結果・失敗の描き分けは、`features/Chat/ToolPart/` に置く
- 返答は、文字のパーツと道具のパーツに分けて描く。文字のパーツは `ui/` の Markdown の部品で、道具のパーツは `ToolPart/` で描く

フォルダの名前を `GenUI` から `ToolPart` にしたのは、省略しない（`GenUI` は Generative UI の省略）ことと、返答のパーツの呼び方（AI SDK の tool part）にそろえるため。

### 結果 (Consequences)

- Good, because 見た目の部品が Storybook と MCP の `UI/` にそろう
- Good, because `features/Chat/` が組み立てだけになり、見た目の部品はほかの機能でも使える
- Good, because `ui/` の部品は契約を知らないので、API の形が変わっても見た目の部品を直さずに済む
- Bad, because Generative UI の部品を 1 つ足すと、触る場所が 2 か所（契約・カタログ）から 3 か所（契約・`ui/` の部品・`ToolPart/` の詰め替えとカタログ）になる

### 確認方法 (Confirmation)

`apps/web/.dependency-cruiser.jsonc` のルールが、`components/ui/` から `features/`・`layouts/`・`pages/` と `@ai-chat/contract` を読むことを止める（`vp run lint:deps`）。

## 各選択肢の評価 (Pros and Cons of the Options)

### 特定の機能を知っているかで決める — 採用

- Good, because 部品が見た目だけかどうかは、作るときに決まり、あとから使う機能が増えても動かさずに済む
- Good, because 見た目と組み立てが分かれ、Storybook でも見た目は `UI/`、組み立てた状態は `Chat/` と分けて見せられる
- Bad, because 契約の形から `ui/` の props への詰め替えを、部品ごとに書く

### 使う機能の数で決める

これまでの決め方。1 つの機能でしか使わない部品は `features/<機能>/` に置き、2 つ以上の機能で使うようになったら `ui/` に下ろす。

- Good, because 部品が、使う機能のそばにある
- Good, because 詰め替えが要らず、契約の型をそのまま props にできる
- Bad, because チャットだけで使う見た目の部品が `features/Chat/` に入り、Storybook と MCP の `UI/` に並ばない
- Bad, because ほかの機能で使うようになると、部品を動かし、契約の型を外す書き直しが要る

## 補足情報 (More Information)

- 関係する ADR: ADR-03（Generative UI はカタログ型にする）、ライブラリ関連/ADR-03（部品に Base UI と CSS Modules を採用）
