import { defineConfig } from "vite-plus";

// *******************************************************************************************
// ワークスペース全体の lint・整形・コミット時の検査設定（アプリのビルド設定は apps/web/vite.config.ts）
// *******************************************************************************************
export default defineConfig({
  // 上から順に 1 つずつ実行する（.vite-hooks/pre-commit の --no-concurrent）。
  // 同時に実行すると、vp check --fix が書き換えている途中のファイルを、下の検査が読んでしまう
  staged: {
    "*": "vp check --fix",
    // 関数にすると、ステージしたファイル名を引数に付けずに実行する
    "apps/web/**/*.{ts,tsx}": () => "vp run web#lint:deps",
    "apps/web/**/*.css": () => "vp run web#lint:css",
    // ステージしたファイルだけでなく全体を型チェックする。contract の変更で実装が合わなくなったときも止める
    "{apps,packages}/**/*.{ts,tsx}": () => "vp run typecheck",
  },
  fmt: {
    sortImports: true,
    // Markdown 内のコード例は、書いた形のまま残す
    embeddedLanguageFormatting: "off",
    ignorePatterns: ["**/routeTree.gen.ts", "**/db/migrations/**"],
    overrides: [
      {
        // VS Code が JSONC の末尾カンマに警告を出すため
        files: ["**/*.jsonc"],
        options: { trailingComma: "none" },
      },
    ],
  },
  lint: {
    ignorePatterns: ["**/routeTree.gen.ts"],
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": ["warn", { allowConstantExport: true }],
      // React Compiler 系。違反があると Compiler がそのコンポーネントの最適化をスキップする
      "react/error-boundaries": "error",
      "react/globals": "error",
      "react/immutability": "error",
      "react/incompatible-library": "error",
      "react/preserve-manual-memoization": "error",
      "react/purity": "error",
      "react/refs": "error",
      "react/set-state-in-effect": "error",
      "react/set-state-in-render": "error",
      "react/static-components": "error",
      "react/unsupported-syntax": "error",
      "react/use-memo": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      "func-style": ["error", "expression"],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-param-reassign": ["error", { props: true }],
    },
    overrides: [
      {
        files: ["packages/contract/src/**"],
        rules: {
          // index.ts は名前で export する。export * だと、何を外に出しているかが読めない
          "oxc/no-barrel-file": ["error", { threshold: 0 }],
          "no-restricted-imports": [
            "error",
            {
              // 2 つ以上上のフォルダへの相対パスは、#/（packages/contract/src。packages/contract/package.json の imports）から書く
              patterns: [
                {
                  group: ["../../*", "../../**"],
                  message:
                    "2 つ以上上のフォルダへの相対パスは使わず、#/ から拡張子まで書いてください（例: #/shared/model/UuidV7.ts）",
                },
              ],
            },
          ],
        },
      },
      {
        files: ["apps/web/src/**"],
        rules: {
          // export * でまとめ直すと、1 つ読むだけで全部を読み込み、開発サーバーも遅くなる
          "oxc/no-barrel-file": ["error", { threshold: 0 }],
          "no-restricted-imports": [
            "error",
            {
              paths: [
                {
                  // React Compiler がメモ化する
                  name: "react",
                  importNames: ["useMemo", "useCallback", "memo"],
                  message:
                    "React Compiler がメモ化するので使わないでください。値を作る計算は utils/ の関数にします",
                },
              ],
              // 2 つ以上上のフォルダへの相対パスは、#/（apps/web/src。apps/web/package.json の imports）から書く
              patterns: [
                {
                  group: ["../../*", "../../**"],
                  message:
                    "2 つ以上上のフォルダへの相対パスは使わず、#/ から拡張子まで書いてください（例: #/client/api/orpc.ts）",
                },
              ],
            },
          ],
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  },
  run: {
    tasks: {
      // GitHub Actions のワークフローの危ない書き方を止める。zizmor は npm で配られていないので uv で動かす。
      // 版は CI（.github/workflows/ci.yaml）とそろえる。ネットにつなぐ検査は CI に任せる
      // zizmor は入力を探すためにリポジトリ全体を読み、どのファイルを変えてもキャッシュが外れるので、入力を .github だけにする
      "lint:actions": {
        command: "uvx zizmor@1.32.0 --offline .",
        cache: { input: [".github/**"] },
      },
    },
  },
  test: {
    // ルートの vp test では何も動かさない。テストは vp run test（apps/web の中で vp test）で動かす。
    // - 設定がないと、apps/web の設定（client の jsdom など）を読まずに、すべての *.test.ts を Node で動かす
    // - projects で apps/web を指すと、Void の plugin がルートを自分のプロジェクトとみなし、ルートにファイルを作る
    include: [],
  },
});
