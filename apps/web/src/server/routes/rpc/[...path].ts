import { defineHandler } from "void";

import { createRpcFetch } from "#/server/rpc/handler.ts";
import { router } from "#/server/rpc/router.ts";

const rpcFetch = createRpcFetch(router);

// /rpc 以下のリクエストをすべて oRPC に渡す
const handle = defineHandler(async (c) => (await rpcFetch(c.req.raw)) ?? c.notFound());

// 契約で使うメソッドを全部受ける
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
