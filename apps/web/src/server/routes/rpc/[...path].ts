import { defineHandler } from "void";

import { createRpcFetch } from "#/server/rpc/handler.ts";
import { router } from "#/server/rpc/router.ts";

const rpcFetch = createRpcFetch(router);

// /rpc 以下のリクエストをすべて oRPC に渡す
const handle = defineHandler(async (c) => (await rpcFetch(c.req.raw)) ?? c.notFound());

// 契約で使うメソッドを全部受ける
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
