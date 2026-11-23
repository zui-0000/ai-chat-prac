import { defineConfig } from "vite-plus";

export default defineConfig({
  // package.json のスクリプトはキャッシュされないので、タスクとして書く
  run: {
    tasks: {
      typecheck: "tsrs --noEmit",
      // 約束を変えたら回して、FE が読む src/minified.json を作り直す
      minify: "vpx scripts/minify.ts",
    },
  },
});
