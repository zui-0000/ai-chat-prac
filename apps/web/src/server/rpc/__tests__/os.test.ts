import { createRouterClient, isDefinedError, safe } from "@orpc/server";

import { os } from "../os";

// 本物の router は DB を読むので、同じ土台（os）に、DB を読まない実装を付けて確かめる
const create = vi.fn<(text: string) => void>();
const client = createRouterClient(
  os.router({
    message: {
      list: os.message.list.handler(() => []),
      create: os.message.create.handler(({ input }) => {
        create(input.text);
        return { id: 1, text: input.text, createdAt: "2026-01-01T00:00:00.000Z" };
      }),
    },
    chat: {
      // oxlint-disable-next-line require-yield -- 何も返さない実装
      stream: os.chat.stream.handler(async function* () {}),
    },
  }),
);

describe("os", () => {
  test("入力が正しくない場合、契約の BAD_REQUEST にして、不正だったフィールドの名前を返すこと", async () => {
    const { error } = await safe(client.message.create({ text: "" }));

    expect(isDefinedError(error)).toBe(true);
    expect(error).toMatchObject({
      code: "BAD_REQUEST",
      message: "入力が正しくありません",
      data: { errors: [{ field: "text" }] },
    });
    expect(create).not.toHaveBeenCalled();
  });

  test("入力が正しくない場合、送られた値をエラーに入れないこと", async () => {
    // 型に合わない値を送る（FE を通さない呼び出し）
    const input = { text: 12345 } as unknown as { text: string };

    const { error } = await safe(client.message.create(input));

    expect(JSON.stringify(error)).not.toContain("12345");
  });

  test("入力がまるごと違う場合、フィールドの名前を空の文字で返すこと", async () => {
    const input = "こんにちは" as unknown as { text: string };

    const { error } = await safe(client.message.create(input));

    expect(error).toMatchObject({ code: "BAD_REQUEST", data: { errors: [{ field: "" }] } });
  });

  test("入力が正しい場合、実装に渡すこと", async () => {
    await client.message.create({ text: "こんにちは" });

    expect(create).toHaveBeenCalledWith("こんにちは");
  });
});
