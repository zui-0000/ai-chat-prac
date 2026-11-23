import { IdSchema } from "@ai-chat/contract";
import { v4, v7 } from "uuid";

// 約束の ID の形（IdSchema）と、BE が ID を作る道具（uuid の v7）が合っていることを確かめる
describe("ID の形", () => {
  const isId = (value: string) => IdSchema["~standard"].validate(value);

  test("uuid の v7 で作った ID が、約束の検査を通ること", async () => {
    expect(await isId(v7())).not.toHaveProperty("issues");
  });

  test("UUIDv4 が、約束の検査を通らないこと", async () => {
    expect(await isId(v4())).toHaveProperty("issues");
  });

  test("大文字の UUIDv7 が、約束の検査を通らないこと", async () => {
    expect(await isId(v7().toUpperCase())).toHaveProperty("issues");
  });
});
