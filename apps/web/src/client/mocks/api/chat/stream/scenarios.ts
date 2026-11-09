import { ORPCError } from "@orpc/server";
import { delay } from "msw";

import { os } from "#/client/mocks/utils/orpc-implementer.ts";

import type { handler } from "./handler";
import { fakeReply } from "./reply";

// この API のシナリオだけを書ける。別の API の実装を入れると型エラーになる
export const scenarios = {
  // 1 文字ずつゆっくり届く。読み込み中の見た目や、途中で止める操作を確かめる
  slow: os.chat.stream.handler(async function* ({ input }) {
    for (const char of fakeReply(input.prompt)) {
      await delay(150);
      yield { delta: char };
    }
  }),
  // 途中まで届いてから切れる
  error: os.chat.stream.handler(async function* ({ input }) {
    for (const char of fakeReply(input.prompt).slice(0, 5)) {
      yield { delta: char };
    }
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "返答の途中で接続が切れました" });
  }),
} satisfies Record<string, typeof handler>;
