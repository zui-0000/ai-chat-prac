import { ORPCError } from "@orpc/client";

import { scenarios, server } from "~/client/mocks/node";

import { client } from "../orpc";

const collectReply = async (prompt: string) => {
  let reply = "";
  for await (const { delta } of await client.chat.stream({ prompt })) {
    reply += delta;
  }
  return reply;
};

describe("oRPC のクライアント（正常系）", () => {
  test("作成したメッセージが一覧に入ること", async () => {
    await client.message.create({ text: "こんにちは" });

    const messages = await client.message.list();
    expect(messages.map((m) => m.text)).toEqual(["こんにちは"]);
  });

  test("テストごとに、偽物の BE の保管が空に戻ること", async () => {
    expect(await client.message.list()).toEqual([]);
  });

  test("返答を少しずつ受け取れること", async () => {
    expect(await collectReply("やあ")).toBe("（偽物）「やあ」への返事です。");
  });
});

describe("oRPC のクライアント（シナリオ）", () => {
  test("message.list.many の場合、30 件が返ること", async () => {
    server.use(scenarios["message.list.many"]);

    expect(await client.message.list()).toHaveLength(30);
  });

  test("message.list.error の場合、ORPCError になること", async () => {
    server.use(scenarios["message.list.error"]);

    await expect(client.message.list()).rejects.toThrow(
      new ORPCError("INTERNAL_SERVER_ERROR", { message: "メッセージを読み込めませんでした" }),
    );
  });

  test("message.create.error の場合、ORPCError になること", async () => {
    server.use(scenarios["message.create.error"]);

    const error = await client.message.create({ text: "x" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ORPCError);
    expect((error as ORPCError<string, unknown>).message).toBe("メッセージを保存できませんでした");
  });

  test("上書きしていない API は、正常系のまま動くこと", async () => {
    server.use(scenarios["message.create.error"]);

    expect(await client.message.list()).toEqual([]);
  });

  test("chat.stream.error の場合、途中まで届いてから ORPCError になること", async () => {
    server.use(scenarios["chat.stream.error"]);

    let reply = "";
    const error = await (async () => {
      for await (const { delta } of await client.chat.stream({ prompt: "やあ" })) {
        reply += delta;
      }
    })().catch((e: unknown) => e);

    expect(reply).toBe("（偽物）「");
    expect(error).toBeInstanceOf(ORPCError);
  });
});
