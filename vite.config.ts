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
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  },
  // run.cache は有効にしない。vp run のキャッシュが型チェックの入力の変化を検知できず、型エラーを見逃すことがある
});
