import { isDefinedError, ORPCError, safe } from "@orpc/client";

import { scenarios, server } from "#/client/mocks/node.ts";

import { client } from "../orpc";

// モックの BE に届いたリクエストのメソッドを、パスごとに覚える
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

type MethodCase = { procedure: string; call: () => Promise<unknown>; method: string };

describe("client", () => {
  test("手続きを呼ぶと、出力が返ること", async () => {
    const message = await client.message.create({ text: "こんにちは" });

    expect(message.text).toBe("こんにちは");
  });

  test.each`
    procedure           | call                                                   | method
    ${"message.list"}   | ${() => client.message.list()}                         | ${"GET"}
    ${"message.create"} | ${() => client.message.create({ text: "こんにちは" })} | ${"POST"}
  `(
    "$procedure を呼んだ場合、契約に書いた $method で送ること",
    async ({ procedure, call, method }: MethodCase) => {
      const methods = recordMethods();

      await call();

      expect(methods.get(`/rpc/${procedure.replace(".", "/")}`)).toBe(method);
    },
  );

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
