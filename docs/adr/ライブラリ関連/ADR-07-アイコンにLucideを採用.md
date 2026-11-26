---
status: accepted
date: 2026-11-26
scope: client
decision-makers: zui
consulted: Claude
informed:
---

# アイコンに Lucide を採用

## 背景と課題 (Context and Problem Statement)

部品を作り始めるにあたって、画面に置くアイコンを、どのライブラリから取るかを決める。最初に作る Button から、文字と並べてアイコンを置く。

このアプリで要りそうなアイコンは、送る・止める・コピー・やり直す・編集・消す・新しい会話・一覧の開閉・設定・ログアウト・注意・チェックくらいである。どの候補にもそろっているので、数は比べない。

見た目は、面を静かにして、赤い線で形を見せる方針にしている（設計関連/ADR-07）。

## 決定要因 (Decision Drivers)

- 見た目の方針（線で形を見せる）と合うこと
- 使ったアイコンだけがバンドルに入ること
- 色と大きさを、部品の CSS で決められること
- セットの中で見た目がそろっていること
- 足す道具や設定が少ないこと
- 保守の状況とライセンス

## 検討した選択肢 (Considered Options)

- Lucide（`lucide-react`）
- Tabler Icons（`@tabler/icons-react`）
- Phosphor Icons（`@phosphor-icons/react`）
- Iconify（`unplugin-icons` で、いろいろなセットから使う分だけ取り込む）

## 決定 (Decision Outcome)

**選択: Lucide**

決め手は、**線で描いたアイコンが、線で形を見せる見た目の方針と合い、そのうえで足す道具も決まりも増えない**こと。Tabler も線のアイコンで、Lucide とほぼ同じ形で使えるが、セットの大きさはこのアプリでは使わない分になる。Phosphor は太さを選べる分、どの太さを使うかの決まりが増える。Iconify は Vite の plugin が要り、セットを混ぜると見た目がそろわなくなる。

### 結果 (Consequences)

- Good, because 線のアイコンなので、赤い線や細い枠と並べても、同じ見た目の言葉で話せる
- Good, because アイコンごとに部品を import するので、使ったものだけがバンドルに入る
- Good, because 色は文字の色（`currentColor`）を使うので、ボタンなどの部品の文字の色に合わせて変わる
- Good, because Vite の plugin も、Storybook の設定も足さずに使える
- Bad, because 塗りのアイコンは持っていないので、塗りで強調したいときは別の手が要る
- Bad, because Lucide に無いアイコンは、自分で SVG を用意する

### 確認方法 (Confirmation)

- `apps/web/package.json` の依存に `lucide-react` があり、ほかのアイコンのライブラリが無いこと
- 部品が `lucide-react` から `〜Icon` の名前でアイコンを import していること

## 各選択肢の評価 (Pros and Cons of the Options)

### Lucide — 採用

- Good, because 線で描いたアイコンで、線の太さと角の形がそろっている
- Good, because アイコンごとのモジュールに分かれていて、`sideEffects: false` なので、使った分だけがバンドルに入る
- Good, because 色は `currentColor` で、大きさは CSS で決められる
- Good, because 依存が無く、更新も続いている。ライセンスは ISC
- Bad, because 塗りのアイコンは無い

### Tabler Icons

- Good, because 線で描いたアイコンで、Lucide と同じく使った分だけがバンドルに入る
- Good, because 線のほかに、塗りのアイコンも持っている
- Good, because 更新が続いている。ライセンスは MIT
- Neutral, because セットが大きく、このアプリでは使わない分が多い
- Bad, because アイコンの本体を、別のパッケージ（`@tabler/icons`）に持っていて、依存が 1 つ増える

### Phosphor Icons

- Good, because 細い線から塗りまで、太さを 6 つから選べる
- Good, because ライセンスは MIT
- Bad, because どの場面でどの太さを使うかの決まりを、別に持つ必要がある
- Bad, because 最後の版（2025 年 5 月）から、1 年以上たっている

### Iconify

- Good, because いろいろなセットのアイコンを、使う分だけ取り込める
- Bad, because Vite の plugin（`unplugin-icons`）が要る。Storybook の設定でも、アプリの plugin を選んで外しているので、扱いを決める必要がある
- Bad, because セットを混ぜると、線の太さや角の形がそろわなくなる。使うセットを絞る決まりが別に要る
- Bad, because 全部のセットを入れるアイコンのデータ（`@iconify/json`）は、展開すると 700 MB を超え、開発の依存が重くなる

## 補足情報 (More Information)

### 比べる前に外したもの

- Heroicons: Lucide と同じく線で描いたアイコンだが、セットが小さく、Lucide より優れる点が見つからなかった
- Material Symbols: 可変フォントとして書体を読み込む使い方が中心で、ほかの候補のように、アイコンを部品として import する形と違う

### この決定が変わりうるとき

- 塗りのアイコンで強調する場面が増えて、Lucide では足りなくなったとき（Tabler をもう一度比べる）
- Lucide に無いアイコンを、自分で用意する数が増えたとき
