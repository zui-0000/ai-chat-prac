# ai-chat-prac

AI チャットを作りながら学ぶ、練習用のリポジトリ。pnpm のモノレポで、ツールチェーンは Vite+（`vp`）を使う。大きな決定の理由は `docs/adr/` にある。

| 場所                | 中身                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `apps/web`          | Void のアプリ。FE は `src/client/`、BE（Worker）は `src/server/` に置く |
| `packages/contract` | FE と BE の間の API の契約（oRPC と valibot）                           |

## コマンド

どれもリポジトリのルートで実行する。

| コマンド              | すること                                         |
| --------------------- | ------------------------------------------------ |
| `vp install`          | 依存を入れる                                     |
| `vp run dev`          | 開発サーバー（画面はモックの BE と話す）         |
| `vp check`            | フォーマット・lint・型チェック                   |
| `vp run typecheck`    | 各パッケージの型チェック                         |
| `vp run lint:deps`    | import の向きの検査                              |
| `vp run lint:actions` | GitHub Actions のワークフローの検査（uv が要る） |
| `vp run test`         | 単体テスト                                       |
