// contract は型だけを import する。値を import すると valibot とスキーマが FE のバンドルに入る
import type { contract } from "@ai-chat/contract";
// 約束から、メソッドなどの手続きの情報だけを残した JSON。スキーマは入っていない
import minified from "@ai-chat/contract/minified.json";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import {
  type AnyContractRouter,
  type ContractRouterClient,
  inferRPCMethodFromContractRouter,
} from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new RPCLink({
  url: `${location.origin}/rpc`,
  // 約束に書いたメソッド（GET・DELETE など）で送る。書いていない手続きは POST になる
  method: inferRPCMethodFromContractRouter(minified as AnyContractRouter),
});

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
