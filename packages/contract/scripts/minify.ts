import { writeFile } from "node:fs/promises";

import { minifyContractRouter } from "@orpc/contract";

import { contract } from "../src/index";

// 約束から、メソッドなどの手続きの情報だけを残した JSON を作る。FE はこれを読んで、手続きごとのメソッドを決める。
// 約束そのものを FE で読むと、スキーマのライブラリが FE のバンドルに入る
const json = JSON.stringify(minifyContractRouter(contract), null, 2);
await writeFile(new URL("../src/minified.json", import.meta.url), `${json}\n`);
