import { RPCHandler } from "@orpc/server/fetch";
import { http } from "msw";

export type OrpcRouter = ConstructorParameters<typeof RPCHandler>[0];

// tsconfig が DOM と Workers（void/env）の両方の型を読むので、グローバルの Request が Workers の形になる。
// MSW が渡すのは DOM の形の Request で、中身は同じなので、型だけ合わせる
type HandledRequest = Parameters<InstanceType<typeof RPCHandler>["handle"]>[0];

// oRPC の通信の形を真似ず、oRPC の RPCHandler を MSW の中で動かす
// router にない API は matched が false になり、次のハンドラに回る。シナリオは、上書きしたい API だけを持てばよい
export const orpcHandler = (target: OrpcRouter) => {
  const handler = new RPCHandler(target);
  return http.all("*/rpc/*", async ({ request }) => {
    const { matched, response } = await handler.handle(request as unknown as HandledRequest, {
      prefix: "/rpc",
    });
    return matched ? response : undefined;
  });
};
