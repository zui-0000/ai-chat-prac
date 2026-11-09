import { ORPCError } from "@orpc/server";

import { os } from "#/client/mocks/utils/orpc-implementer.ts";

import type { handler } from "./handler";

// この API のシナリオだけを書ける。別の API の実装を入れると型エラーになる
export const scenarios = {
  error: os.message.create.handler(() => {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "メッセージを保存できませんでした" });
  }),
} satisfies Record<string, typeof handler>;
