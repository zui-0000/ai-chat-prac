import { contract } from "@ai-chat/contract";
import { implement } from "@orpc/server";
import { messages } from "@schema";
import { db } from "void/db";

const os = implement(contract);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const router = os.router({
  message: {
    list: os.message.list.handler(async () => db.select().from(messages)),
    create: os.message.create.handler(async ({ input }) => {
      const [row] = await db.insert(messages).values({ text: input.text }).returning();
      if (!row) throw new Error("メッセージを保存できませんでした");
      return row;
    }),
  },
  chat: {
    // TODO: AI の API につなぐ。今は固定の文を 1 文字ずつ返す
    stream: os.chat.stream.handler(async function* ({ input }) {
      for (const char of `「${input.prompt}」への返事です。少しずつ届きます。`) {
        await sleep(30);
        yield { delta: char };
      }
    }),
  },
});
