import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

import { CSS_TARGET } from "./cssTarget.ts";

// 単体テストの共通の設定
const unitTest = {
  // describe・test・expect を import せずに使う。型は tsconfig.test.json で __tests__ にだけ足す
  globals: true,
  // テストごとに、vi.stubGlobal と vi.spyOn で差し替えたものを元に戻す
  unstubGlobals: true,
  restoreMocks: true,
};

export default defineConfig({
  // package.json のスクリプトはキャッシュされないので、キャッシュしたいものはここにタスクとして書く。
  // run の中は変数を使わず値をそのまま書く。値だけなら vp run は設定を実行せずに読むが、変数があると設定を実行し、
  // Void の plugin がルートを自分のアプリとみなして、ルートに .void を作る
  run: {
    tasks: {
      // .void/v3 は Void の plugin が読み書きするローカルの実行状態（miniflare の DB など）。
      // 動かすたびに書き換わるので、入力に入れると毎回キャッシュが外れる。出力として戻しもしない
      build: {
        command: "vp build",
        cache: {
          input: [{ auto: true }, "!.void/v3/**"],
          output: [{ auto: true }, "!.void/v3/**"],
        },
      },
      // tsrs はファイルの読み込みを Vite Task が追える。Go の tsc に戻すと追えず、型エラーを見逃すので cache: false にする
      typecheck: "tsrs --noEmit -p tsconfig.app.json && tsrs --noEmit -p tsconfig.test.json",
      "lint:deps": "depcruise src --config .dependency-cruiser.jsonc --output-type err-long",
      // 部品の CSS に、色の値・色の材料・定義の無い CSS 変数・配色ごとの書き分けを書いていないか（stylelint.config.js）
      "lint:css": 'stylelint "src/**/*.css"',
      // ストーリーとトークンのページが壊れていないか。開発サーバーの storybook は package.json のスクリプト（キャッシュしない）
      "build-storybook": {
        command: "storybook build --quiet",
        cache: {
          input: [{ auto: true }, "!.void/v3/**"],
          output: [{ auto: true }, "!.void/v3/**"],
        },
      },
      test: {
        command: "vp test",
        cache: {
          input: [{ auto: true }, "!.void/v3/**"],
          output: [{ auto: true }, "!.void/v3/**"],
        },
      },
      "test:client": {
        command: "vp test --project client",
        cache: {
          input: [{ auto: true }, "!.void/v3/**"],
          output: [{ auto: true }, "!.void/v3/**"],
        },
      },
      "test:server": {
        command: "vp test --project server",
        cache: {
          input: [{ auto: true }, "!.void/v3/**"],
          output: [{ auto: true }, "!.void/v3/**"],
        },
      },
    },
  },
  plugins: [
    // react() より前に置く必要がある
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/client/routes",
      generatedRouteTree: "./src/client/routeTree.gen.ts",
      // __tests__ をルートとして読まない（Route を export していないという警告が出る）
      routeFileIgnorePattern: "__tests__",
    }),
    react({ compiler: true }),
    voidPlugin(),
    // 開発サーバーで MSW の Service Worker を配り、virtual:msw を使えるようにする
    msw(),
  ],
  build: {
    cssTarget: CSS_TARGET,
  },
  test: {
    // extends: true で plugins を引き継ぐ。@schema・void/db などの解決に Void の plugin が要る
    projects: [
      {
        extends: true,
        test: {
          ...unitTest,
          name: "client",
          include: ["src/client/**/__tests__/**/*.test.{ts,tsx}"],
          // モックの BE（MSW）を立ち上げる
          setupFiles: ["./src/client/__setup__/setup.ts"],
          // ブラウザで動くコードなので、DOM と localStorage を真似る
          environment: "jsdom",
        },
      },
      {
        extends: true,
        test: {
          ...unitTest,
          name: "server",
          include: ["src/server/**/__tests__/**/*.test.ts"],
          // Worker で動くコードなので、DOM を持たない環境で動かす
          environment: "node",
        },
      },
    ],
  },
});
