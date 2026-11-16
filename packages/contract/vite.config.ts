import { defineConfig } from "vite-plus";

export default defineConfig({
  // package.json のスクリプトはキャッシュされないので、タスクとして書く
  run: {
    tasks: {
      typecheck: "tsrs --noEmit",
    },
  },
});
