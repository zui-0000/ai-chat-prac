import { contract } from "@ai-chat/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { type ContractRouterClient, inferRPCMethodFromContractRouter } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new RPCLink({
  url: `${location.origin}/rpc`,
  // 契約に書いたメソッド（GET・DELETE など）で送る。書いていない手続きは POST になる
  method: inferRPCMethodFromContractRouter(contract),
});

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
