import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { voidPlugin } from "void";

// 単体テストの共通の設定
const unitTest = {
  // describe・test・expect を import せずに使う。型は tsconfig.test.json で __tests__ にだけ足す
  globals: true,
  // テストごとに、vi.stubGlobal と vi.spyOn で差し替えたものを元に戻す
  unstubGlobals: true,
  restoreMocks: true,
};

export default defineConfig({
  resolve: {
    // tsconfig.app.json の paths（~/*）と対で必要。tsconfig は型を、こちらは実行時の解決を受け持つ
    alias: { "~": `${import.meta.dirname}/src` },
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
  ],
  test: {
    // extends: true で plugins を引き継ぐ。@schema・void/db などの解決に Void の plugin が要る
    projects: [
      {
        extends: true,
        test: {
          ...unitTest,
          name: "client",
          include: ["src/client/**/__tests__/**/*.test.{ts,tsx}"],
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
