# 004 部品は Base UI と CSS Modules で作る

- 状態: 採用
- 日付: 2026-11-14

## 背景

画面の部品と見た目の作り方を決める。AI チャット向けの UI ライブラリはいくつかあるが、どれも shadcn/ui と Tailwind を前提にしている。

## 決めたこと

- 部品の振る舞いは Base UI に任せ、見た目は CSS Modules とデザイントークン（CSS 変数）で書く
- 部品は `apps/web/src/client/components/` に置き、別のパッケージ（`packages/ui`）には分けない
- 部品の状態とアニメーションは、Base UI が付ける data 属性で CSS に書く
- メッセージ・入力欄・会話の一覧は、自分で作る

決め手: モダンなチャットの見た目は、素の CSS（`field-sizing`・`overflow-anchor`・`@starting-style`・View Transitions・コンテナークエリ・`light-dark()`）で作れる。

## ほかの案

| 案                                                           | 選ばなかった理由                                                                                      |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| shadcn/ui と Tailwind                                        | 元にする design-system-prac の作り方（トークンと CSS Modules）と合わない                              |
| AI チャット向けの UI ライブラリ（AI Elements・assistant-ui） | shadcn と Tailwind が前提                                                                             |
| 部品を `packages/ui` に分ける                                | 使うのは `apps/web` だけで、CSS Modules・トークン・型チェック・Storybook の設定がパッケージごとに要る |

## 手放すもの

- チャット向けの出来合いの部品が使えない。メッセージ・入力欄・会話の一覧を自分で作る
- CSS Modules では、定義の無い CSS 変数を打ち間違えても、ブラウザは黙って無視する。検査の道具で補う
