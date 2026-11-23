import { contract } from "@ai-chat/contract";
import minified from "@ai-chat/contract/minified.json";
import { isDefinedError, ORPCError, safe } from "@orpc/client";
import { minifyContractRouter } from "@orpc/contract";

import { scenarios, server } from "#/client/mocks/node.ts";

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

describe("oRPC のクライアント（メソッド）", () => {
  // 偽物の BE に届いたリクエストのメソッドを、手続きのパスごとに覚える
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

  test("約束で GET の印を付けた手続きは、GET で送られること", async () => {
    const methods = recordMethods();

    await client.message.list();

    expect(methods.get("/rpc/message/list")).toBe("GET");
  });

  test("印の無い手続きは、POST で送られること", async () => {
    const methods = recordMethods();

    await client.message.create({ text: "こんにちは" });

    expect(methods.get("/rpc/message/create")).toBe("POST");
  });

  test("FE が読む JSON（minified.json）が、約束とずれていないこと", () => {
    // ずれていたら vp run @ai-chat/contract#minify で作り直す
    expect(minified).toEqual(JSON.parse(JSON.stringify(minifyContractRouter(contract))));
  });
});

describe("oRPC のクライアント（約束に書いたエラー）", () => {
  test("入力が正しくない場合、BAD_REQUEST と不正だったフィールドの名前が届くこと", async () => {
    const { error } = await safe(client.message.create({ text: "" }));

    expect(isDefinedError(error) && error.code === "BAD_REQUEST" && error.data).toEqual({
      errors: [{ field: "text" }],
    });
  });

  test("message.list.unauthorized の場合、UNAUTHORIZED が届くこと", async () => {
    server.use(scenarios["message.list.unauthorized"]);

    const { error } = await safe(client.message.list());

    expect(isDefinedError(error) && error.code).toBe("UNAUTHORIZED");
    expect(error?.message).toBe("ログインが必要です");
  });

  test("chat.stream.aiFailed の場合、AI_FAILED が届くこと", async () => {
    server.use(scenarios["chat.stream.aiFailed"]);

    const { error } = await safe(client.chat.stream({ prompt: "やあ" }));

    expect(isDefinedError(error) && error.code).toBe("AI_FAILED");
    expect(error?.message).toBe("AI が返答できませんでした");
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
