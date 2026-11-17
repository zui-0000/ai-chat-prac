---
paths:
  - "apps/web/src/client/routes/**"
  - "apps/web/src/client/main.tsx"
---

# ルーティング

TanStack Router のファイルベースルーティングを使う。画面の一覧と移り方は `docs/05-画面を決める.md` にある。

- ファイル名がそのまま URL になる（`about.tsx` → `/about`）。経路でないファイルを `routes/` に置かない。どうしても置くなら名前の先頭に `-` を付ける
- `routes/__root.tsx` は必須で、名前も変えられない
- 複数の画面で共通の枠は、パスを持たないレイアウトのルート（`_` で始まるルート）に `layouts/` の部品を付ける。URL が変わっても枠は描き直されず、`<Outlet />` の中身だけが入れ替わる
- `createFileRoute` の引数は生成器が書き換えるので、文字列のまま書く
- `src/client/routeTree.gen.ts` は自動で作られる。手で書き換えない。コミットはする
