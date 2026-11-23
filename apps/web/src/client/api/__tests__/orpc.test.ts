import { isDefinedError, ORPCError, safe } from "@orpc/client";

import { scenarios, server } from "#/client/mocks/node.ts";

import { client } from "../orpc";

// 偽物の BE に届いたリクエストのメソッドを、パスごとに覚える
const recordMethods = () => {
  const methods = new Map<string, string>();
  const listener = ({ request }: { request: Request }) => {
    methods.set(new URL(request.url).pathname, request.method);
  };
  server.events.on("request:start", listener);
  onTestFinished(() => {
    server.events.removeListener("request:start", listener);
  });
  return methods;
};

describe("client", () => {
  test("手続きを呼ぶと、出力が返ること", async () => {
    const message = await client.message.create({ text: "こんにちは" });

    expect(message.text).toBe("こんにちは");
  });

  test("返答を少しずつ受け取れること", async () => {
    let reply = "";
    for await (const { delta } of await client.chat.stream({ prompt: "やあ" })) {
      reply += delta;
    }

    expect(reply).toBe("（偽物）「やあ」への返事です。");
  });

  test("契約に GET と書いた手続きの場合、GET で送ること", async () => {
    const methods = recordMethods();

    await client.message.list();

    expect(methods.get("/rpc/message/list")).toBe("GET");
  });

  test("契約にメソッドを書いていない手続きの場合、POST で送ること", async () => {
    const methods = recordMethods();

    await client.message.create({ text: "こんにちは" });

    expect(methods.get("/rpc/message/create")).toBe("POST");
  });

  test("契約に書いたエラーの場合、コードで見分けられること", async () => {
    server.use(scenarios["message.list.unauthorized"]);

    const { error } = await safe(client.message.list());

    expect(isDefinedError(error) && error.code).toBe("UNAUTHORIZED");
  });

  test("入力が正しくない場合、不正だったフィールドの名前が届くこと", async () => {
    const { error } = await safe(client.message.create({ text: "" }));

    expect(isDefinedError(error) && error.code === "BAD_REQUEST" && error.data).toEqual({
      errors: [{ field: "text" }],
    });
  });

  test("契約に無いエラーの場合、ORPCError になること", async () => {
    server.use(scenarios["message.list.error"]);

    const { error } = await safe(client.message.list());

    expect(error).toBeInstanceOf(ORPCError);
    expect(isDefinedError(error)).toBe(false);
  });
});
