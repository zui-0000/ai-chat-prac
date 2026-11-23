---
status: accepted
date: 2026-11-14
scope: all
decision-makers: zui
consulted: Claude
informed:
---

# Generative UI はカタログ型にする

## 背景と課題 (Context and Problem Statement)

AI の返答の中に部品（選択肢・グラフなど）を出す。作り方は 2 つある。

- カタログ型: AI は、決められた部品の名前と props だけを出す
- マークアップ型: AI が JSX や HTML を書く

## 決定要因 (Decision Drivers)

- 見た目がデザインシステム（ライブラリ関連/ADR-03）の外に出ないこと
- AI が書いたマークアップを、そのまま描かないこと
- BE が AI の出力を確かめ、FE が型つきで受け取れること

## 検討した選択肢 (Considered Options)

- カタログ型
- マークアップ型

あわせて、カタログ型の要になる AI のモデルについて次の案も比べた。

- AI のモデルに Workers AI を使う（モデルの案）

## 決定 (Decision Outcome)

**選択: カタログ型**

決め手は、**AI が出すのは部品の名前と props だけなので、見た目がデザインシステムの外に出ず、AI が書いたマークアップも描かずに済む**こと。

- AI の出力は、部品の種類（`kind`）で分かれる形にし、FE のカタログが種類から部品を選ぶ
- 部品の props は、契約（`packages/contract`）に valibot で書く（ライブラリ関連/ADR-05）
- 最初の版の部品は「選択肢」（押せる部品）と「棒グラフ」（見せる部品）。表は部品にせず、Markdown の表で出す
- 部品も保存し、会話を開き直したときに同じ部品を出す
- 部品は、チャットの機能の中（`apps/web/src/client/components/features/Chat/GenUI/`）に置く
- アプリの AI には Claude を使う。決められた部品と props を正しく選べるかが、カタログ型の要になる

### 結果 (Consequences)

- Good, because 見た目がデザインシステムの外に出ない
- Good, because BE が AI の出力を確かめ、FE が型つきで受け取れる
- Bad, because 部品を足すたびに、契約とカタログの両方を足す
- Bad, because 外のデータを使う部品（天気・地図）や入力フォームは、ツールの実行まで要るので、最初の版では作らない

## 各選択肢の評価 (Pros and Cons of the Options)

### カタログ型 — 採用

- Good, because 部品と props を契約で縛れる
- Good, because 部品の状態（呼んでいる途中・結果・失敗）を、Storybook で状態ごとに見られる

### マークアップ型

- Good, because 決めていない形の部品も、AI がその場で作れる
- Bad, because 見た目がデザインシステムの外に出る
- Bad, because AI が書いたマークアップを描くことになる
- Bad, because AI が書くクラスのために Tailwind が要り、CSS Modules（ライブラリ関連/ADR-03）と合わない

### AI のモデルに Workers AI を使う（モデルの案）

- Good, because Cloudflare の中で動く
- Bad, because 日本語と、道具（部品）の選び方が弱め
