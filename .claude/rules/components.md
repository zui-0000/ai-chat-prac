---
paths:
  - "apps/web/src/client/components/**"
  - "apps/web/src/client/styles/**"
  - "apps/web/src/client/assets/**"
---

# 部品の置き方

理由は `docs/06-デザインシステムを決める.md` にある。

## どこに置くか

| 置き場所                          | 置くもの                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| `components/ui/`                  | どの機能でも使う汎用の部品（Button・Input・Markdown など）             |
| `components/features/<機能>/`     | その機能に結びついた部品（`features/Chat/Composer/`）                  |
| `components/features/Chat/GenUI/` | Generative UI の部品と、道具の名前から部品を選ぶ `catalog.tsx`         |
| `components/layouts/`             | 複数のページが使う枠（`RootLayout`・`ChatLayout` など）                |
| `components/pages/`               | 1 つの URL の画面。ルートの `component` に渡す                         |
| `styles/`                         | 全体の CSS とトークン。クラスは置かない                                |
| `assets/`                         | 画面で使う画像（`images/`）と、lucide-react に無いアイコン（`icons/`） |

- どの機能でも使えるものは `ui/`、1 つの機能でしか使わないものは `features/` に置く
- 複数の URL で共通の枠は `layouts/` に置く。`pages/` は URL と 1 対 1、`features/` は機能の置き場所なので、枠は置かない
- favicon など、URL が決まっているファイルは `apps/web/public/` に置く

## 依存の向き

```text
routes/ → pages/・layouts/ → features/ → ui/
```

- 逆向きに import しない（`ui/` から `features/`・`layouts/` を読まない）
- `features/` 同士は import しない。別の機能で要るものは `ui/` に下ろす
- `pages/` と `layouts/` は、お互いに import しない
- import を変えたら `vp run lint:deps` を実行する

## ファイルの形

- 1 フォルダ 1 部品。フォルダ名は部品の名前（PascalCase）で、どの置き場所でも入口は `index.tsx`

  ```text
  ui/Dialog/
  ├── index.tsx
  ├── index.module.css
  ├── index.stories.tsx
  ├── index.interaction.stories.tsx   触ったときの動き（play function）
  └── index.guide.mdx                 いつ使うか
  ```

- 部品で使う hook は部品のフォルダの `hooks/use<名前>.ts`、React を使わない処理は `utils/` に置く。hook は React につなぐだけにし、処理は `utils/` に書く
- `hooks/`・`utils/` を同じ機能のほかの部品でも使うようになったら `features/<機能>/` の直下に、別の機能でも使うなら `ui/` か `features/` の外に移す

## export と import

- パーツが 1 つの部品は、名前で export する（`export const Button = …`）。使う側は `import { Button } from "#/client/components/ui/Button/index.tsx"`
- パーツが複数の部品は、パーツを `Root`・`Title` などの名前で export する。使う側は必ず `import * as Dialog from "…/Dialog/index.tsx"` で読み、`<Dialog.Root>` と書く。`import { Title }` で読まない
- 名前空間をオブジェクト（`export const Dialog = { Root }`）で作らない。React の Fast Refresh が効かなくなる
- ページは `<名前>Page`（`ChatPage`）、枠は `<名前>Layout`（`RootLayout`）の名前で export する

## Base UI

- Base UI（`@base-ui/react`）に同じ役目の部品があれば、それを包んで作る
- 状態の見た目は、JS でクラスを切り替えず、Base UI が付ける data 属性（`[data-disabled]`・`[data-highlighted]` など）のセレクターで CSS に書く
- アニメーションは、Base UI の部品なら `[data-starting-style]`・`[data-ending-style]`、Base UI の外（新しく出てくるメッセージなど）なら CSS の `@starting-style` で書く
- ダイアログの中の Select のように、ポップアップを入れ子にするときは、内側の `Portal` に `container` を渡して外側の中に描く
- メニューの項目で画面を移るときは、項目の `render` に TanStack Router の `Link` を渡す

## アイコン

- `lucide-react` を使い、`SendIcon` のように `Icon` の付いた名前で import する
- 大きさは使う側で渡さず、置き場所の部品の CSS で決める
- 文字と一緒に置くアイコンには何も付けない（Lucide が `aria-hidden` を付ける）。アイコンだけのボタンには `aria-label` で名前を付ける
- lucide-react に無いものだけ、`assets/icons/` に SVG を置く

## スタイル

- 部品のスタイルは、部品のフォルダの `index.module.css` に書く。部品の CSS に `@layer` を書かない
- 色・余白・大きさ・文字・角丸・影・重なりは、`styles/tokens/` のトークン（CSS 変数）を使う。合うものが無ければ、値を直接書く前にトークンを足す
- 色は意味のトークン（`--color-foreground` など）だけを使う。`#fff` のような値や、色の材料のトークンを部品に書かない
- ライトとダークの書き分け（`@media (prefers-color-scheme)`・`[data-theme]`）を部品の CSS に書かない。意味のトークンが切り替える
- レイアウトの境目（`@container (width < 30rem)` の `30rem` など）は、部品ごとの値なので直接書いてよい
- `ui/` の部品は `className` と `style` を受け付けない。置く位置や間隔は、使う側の親が決める
- 同じ見た目のクラスがほかの部品でも要るようになったら、書き写さずに `ui/` の部品にする

## Storybook

- `ui/` の部品と `features/Chat/` の部品は、ストーリーを書く。`features/Chat/` はストリーミング中・道具の呼び出し中・エラーなどの状態ごとに並べる
- タイトルは `UI/<部品名>`・`Chat/<部品名>`。触ったときの確認は `index.interaction.stories.tsx` に書き、`Interaction/` に並べる
- `layouts/`・`pages/` と、`Chat` 以外の `features/` はストーリーを書かない
