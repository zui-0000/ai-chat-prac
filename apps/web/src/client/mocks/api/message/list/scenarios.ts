import { ORPCError } from "@orpc/server";

import { os } from "~/client/mocks/utils/orpc-implementer";

import type { handler } from "./handler";

// この API のシナリオだけを書ける。別の API の実装を入れると型エラーになる
export const scenarios = {
  // 長い一覧の見た目を確かめる
  many: os.message.list.handler(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      text: `メッセージ ${i + 1}`,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
    })),
  ),
  error: os.message.list.handler(() => {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "メッセージを読み込めませんでした" });
  }),
} satisfies Record<string, typeof handler>;
