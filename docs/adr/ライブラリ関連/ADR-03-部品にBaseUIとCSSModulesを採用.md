---
status: accepted
date: 2026-11-14
scope: client
decision-makers: zui
consulted: Claude
informed:
---

# 部品に Base UI と CSS Modules を採用

## 背景と課題 (Context and Problem Statement)

画面の部品と見た目の作り方を決める。元にする design-system-prac は、デザイントークン（CSS 変数）と CSS Modules で見た目を作っている。

AI チャット向けの UI ライブラリはいくつかあるが、どれも shadcn/ui と Tailwind を前提にしている。

## 決定要因 (Decision Drivers)

- 元にする design-system-prac の作り方（トークンと CSS Modules）を持ち込めること
- ダイアログ・メニューなどの振る舞いとアクセシビリティを、自分で作らずに済むこと
- モダンなチャットの見た目（入力欄の伸び縮み・一番下への張り付き・ダークモードなど）を作れること

## 検討した選択肢 (Considered Options)

- Base UI と CSS Modules
- shadcn/ui と Tailwind
- AI チャット向けの UI ライブラリ（AI Elements・assistant-ui）

あわせて、部品の置き場所について次の案も比べた。

- 部品を `packages/ui` に分ける（置き場所の案）

## 決定 (Decision Outcome)

**選択: Base UI と CSS Modules**

決め手は、**振る舞いは Base UI に任せ、見た目はトークンと CSS Modules で、元にするデザインシステムの作り方のまま書ける**こと。チャットの見た目も、素の CSS（`field-sizing`・`overflow-anchor`・`@starting-style`・View Transitions・コンテナークエリ・`light-dark()`）で作れる。

- 部品は `apps/web/src/client/components/` に置き、別のパッケージ（`packages/ui`）には分けない
- 部品の状態とアニメーションは、Base UI が付ける data 属性で CSS に書く

### 結果 (Consequences)

- Good, because 見た目の決まり（トークン）が 1 か所にまとまる
- Good, because 振る舞いとアクセシビリティを Base UI に任せられる
- Bad, because チャット向けの出来合いの部品が使えない。メッセージ・入力欄・会話の一覧を自分で作る
- Bad, because CSS Modules では、定義の無い CSS 変数を打ち間違えても、ブラウザは黙って無視する。検査の道具で補う

### 確認方法 (Confirmation)

`apps/web/package.json` に Tailwind と shadcn/ui の依存が無いこと。部品の CSS が `index.module.css` にあること。

## 各選択肢の評価 (Pros and Cons of the Options)

### Base UI と CSS Modules — 採用

- Good, because トークンと CSS Modules をそのまま使える
- Good, because 部品の状態を data 属性のセレクターで書け、JS でクラスを切り替えずに済む
- Bad, because 入れ子のポップアップの描画先など、Base UI の作法を覚える必要がある

### shadcn/ui と Tailwind

- Good, because 出来合いの部品と例が多い
- Bad, because 元にする design-system-prac の作り方（トークンと CSS Modules）と合わない

### AI チャット向けの UI ライブラリ（AI Elements・assistant-ui）

- Good, because メッセージ・入力欄・会話の一覧が最初からある
- Bad, because shadcn/ui と Tailwind が前提で、上の案と同じ理由で合わない

### 部品を `packages/ui` に分ける（置き場所の案）

- Good, because 別のアプリでも使い回せる
- Bad, because 使うのは `apps/web` だけで、CSS Modules・トークン・型チェック・テスト・Storybook の設定がパッケージごとに要る
