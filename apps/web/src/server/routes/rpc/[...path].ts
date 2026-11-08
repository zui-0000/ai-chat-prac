// /rpc 以下のリクエストをすべて oRPC に渡す
import { RPCHandler } from "@orpc/server/fetch";
import { defineHandler } from "void";

import { router } from "~/server/rpc/router";

const handler = new RPCHandler(router);

const handle = defineHandler(async (c) => {
  const { matched, response } = await handler.handle(c.req.raw, { prefix: "/rpc" });
  return matched ? response : c.notFound();
});

export const GET = handle;
export const POST = handle;
