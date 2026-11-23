import { defineMiddleware } from "void";

import { createRpcFetch } from "#/server/rpc/handler.ts";
import { router } from "#/server/rpc/router.ts";

const rpcFetch = createRpcFetch(router);

// /rpc 以下のリクエストを、メソッドを問わず oRPC に渡す
export default defineMiddleware(async (c, next) => {
  if (!c.req.path.startsWith("/rpc/")) return next();
  return (await rpcFetch(c.req.raw)) ?? c.notFound();
});
