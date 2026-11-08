import { defineConfig } from "void/config";

export default defineConfig({
  // Void の規約ディレクトリ（routes/・db/ など）を src/server から読み、BE のコードを src/server にまとめる
  sourceDir: "src/server",
  routing: {
    typedRoutes: true,
  },
  worker: {
    // Workers の実行時の挙動をこの日付の時点に固定する。上げると、それ以降の挙動の変更が入る
    compatibility_date: "2026-02-24",
  },
});
