---
status: accepted
date: 2026-11-26
scope: client
decision-makers: zui
consulted: Claude
informed:
---

# client の単体テストは jsdom で動かす

## 背景と課題 (Context and Problem Statement)

`apps/web/src/client` の単体テストは、jsdom の上で動いている。これから hook のテスト（`renderHook`）とルートのテストが増えるので、その前に DOM の環境を比べた。

このリポジトリでは、部品を描くテストは書かない。見た目は Storybook で見て、通しの動きは E2E で確かめる。client の単体テストが確かめるのは、hook・関数・ルーターになる。API を呼ぶテストでは、モックの BE（MSW）を Node の中で立て、開発サーバーの画面と同じシナリオを使う（シナリオは設計関連/ADR-02）。

## 決定要因 (Decision Drivers)

- 今のテストが、MSW を通るものも含めて、そのまま通ること
- Vite+ の `vp test`（Vitest 5.1.1）と Void の plugin で動くこと
- 速いこと
- ブラウザの機能をどこまで持っているか
- 依存の重さと、保守の状況
- CI での手間

## 検討した選択肢 (Considered Options)

- jsdom（31.0.1）
- happy-dom（21.0.4）
- Vitest のブラウザモード（`@vitest/browser-playwright` 5.1.1 と playwright 1.65.1。headless の Chromium で動かす）

## 決定 (Decision Outcome)

**選択: jsdom**

決め手は、**happy-dom に変えても、速くなるのは Vitest の時間で 2〜3 割、プロセス全体で 1 割ほどにとどまり、CSS の計算は jsdom のほうが本物に近い**こと。ブラウザモードは本物に一番近い。ただ、MSW の準備をブラウザ用に作り直す必要があり、CI にもブラウザのダウンロードが増える。部品を描くテストは書かないので、その忠実さが生きる場面は少ない。

### 結果 (Consequences)

- Good, because 今のテストと MSW の準備を、そのまま使える
- Good, because `getComputedStyle` が `light-dark()` と `calc()` を計算し、本物に近い値を返す
- Good, because CI に何も足さない
- Bad, because 環境の立ち上げが happy-dom より少し遅い
- Bad, because `ResizeObserver` などを使う hook のテストでは、差し替えが要る

### 確認方法 (Confirmation)

- `apps/web/vite.config.ts` で、client の project の `environment` が `jsdom` であること
- `src/client/__tests__/environment.test.ts` が、DOM と `localStorage` を使えることを見張っていること

## 各選択肢の評価 (Pros and Cons of the Options)

3 つの環境で、client の単体テストをそれぞれ 6 回ずつ動かして測った。ローカルの macOS で測り、終了コードは全部 0 だった。値は、1 回目の変換のキャッシュが効いたあとのもの。

| 測ったもの                                    | jsdom             | happy-dom         | ブラウザモード    |
| --------------------------------------------- | ----------------- | ----------------- | ----------------- |
| 全部のテスト（5 ファイル・24 件。MSW を含む） | 0.66 秒（1.8 秒） | 0.50 秒（1.6 秒） | 読み込みで落ちた  |
| MSW を通らないテスト（4 ファイル・18 件）     | 0.46 秒（1.5 秒） | 0.33 秒（1.4 秒） | 0.61 秒（2.0 秒） |

値は、どれもおよその値。外が Vitest の Duration、かっこの中がプロセス全体の時間。jsdom と happy-dom では、Duration の 6〜9 割が環境の立ち上げだった。テストの数が少ないので、今は差が小さい。MSW を通らないテストの行は、3 つの環境とも、テストの準備（MSW を立てる `setupFiles`）を外して測った。

ブラウザの機能は、使い捨てのテストで調べた。

| 機能                                                       | jsdom    | happy-dom  | ブラウザモード |
| ---------------------------------------------------------- | -------- | ---------- | -------------- |
| `ResizeObserver`・`IntersectionObserver`・`matchMedia`     | 無い     | ある       | ある           |
| `<dialog>` の `showModal()`・`elementFromPoint()`・`inert` | 無い     | ある       | ある           |
| Popover API（`showPopover()`）                             | 無い     | 無い       | ある           |
| `getComputedStyle` の `light-dark()`・`calc()`             | 計算する | 計算しない | 計算する       |
| レイアウト（要素の幅）                                     | しない   | しない     | する           |
| `fetch`・`AbortSignal`・`BroadcastChannel`・History API    | ある     | ある       | ある           |

### jsdom — 採用

- Good, because 今のテストが全部通る
- Good, because `getComputedStyle` が `light-dark()` と `calc()` を計算する
- Good, because npm の provenance がある
- Neutral, because 直接の依存が約 18 個あり、3 つの中で一番多い
- Bad, because `ResizeObserver`・`matchMedia`・`<dialog>`・Popover API など、無い API が多い
- Bad, because 環境の立ち上げが、happy-dom より遅い

### happy-dom

- Good, because 今のテストが、MSW を通るものも含めて全部通る
- Good, because jsdom より速い（Vitest の時間で 2〜3 割、プロセス全体で 1 割ほど）
- Good, because `ResizeObserver`・`matchMedia`・`<dialog>` など、jsdom に無い API を持っている
- Good, because 直接の依存が約 7 個と少なく、npm の provenance がある
- Bad, because `getComputedStyle` が、`light-dark()` を空で返し、`calc()` を計算しないまま返す
- Bad, because 速くなる分は環境の立ち上げで、テストの数が少ない今は、変える手間に見合わない

### Vitest のブラウザモード

- Good, because 本物の Chromium なので、調べた API が全部あり、レイアウトも CSS の計算も本物
- Good, because npm の provenance がある
- Bad, because テストの準備が Node 用の MSW（`msw/node`）を読むので、そのままでは 5 ファイルとも読み込みで落ちる。MSW の準備を、ブラウザ用に作り直す必要がある
- Bad, because MSW を通らないテストでも、3 つの中で一番遅い
- Bad, because provider の版を、Vite+ が持つ Vitest の版にそろえ続ける必要がある
- Bad, because CI で Chromium をダウンロードする手間が増える（headless shell で約 100 MB）
- Bad, because 部品を描くテストを書かないので、本物のブラウザの忠実さが生きる場面が少ない

## 補足情報 (More Information)

### 比べる前に外したもの

- ブラウザモードの Preview の provider: 自分のブラウザを開いて動かすので、CI で使えない
- ブラウザモードの WebdriverIO の provider: Vitest 本体ではなく、コミュニティが保守している
- Storybook の Vitest の addon: ストーリーを部品のテストとして動かすもので、部品を描くテストを書かない方針と合わない

### この決定が変わりうるとき

- テストが増えて、環境の立ち上げ以外の時間が目立ってきたとき（happy-dom をもう一度測る）
- 部品の見た目や動きを確かめる方針（VRT・E2E）を決めたとき、または部品を描くテストを書く方針に変わったとき（ブラウザモードをもう一度比べる）
