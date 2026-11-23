import { createORPCClient, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { os, type RouterClient } from "@orpc/server";

import { createRpcFetch } from "../handler";

// 本物の router は DB を読むので、メソッドの違う手続きだけを持つ router で確かめる
const calls = vi.fn<(name: string) => void>();
const router = {
  read: os.route({ method: "GET" }).handler(() => {
    calls("read");
    return "read";
  }),
  write: os.handler(() => {
    calls("write");
    return "write";
  }),
  remove: os.route({ method: "DELETE" }).handler(() => {
    calls("remove");
    return "remove";
  }),
};
const rpcFetch = createRpcFetch(router);

const ORIGIN = "https://app.example";

// oRPC のクライアントから呼ぶ。応答を取っておき、ヘッダーを見られるようにする
const createClient = (method: "GET" | "POST" | "DELETE", headers: Record<string, string> = {}) => {
  const responses: Response[] = [];
  const link = new RPCLink({
    url: `${ORIGIN}/rpc`,
    method,
    headers,
    fetch: async (request) => {
      const response = (await rpcFetch(request)) ?? new Response(null, { status: 404 });
      responses.push(response);
      return response;
    },
  });
  const client: RouterClient<typeof router> = createORPCClient(link);
  return { client, responses };
};

const request = (path: string, method: string, headers: Record<string, string>) =>
  new Request(`${ORIGIN}/rpc/${path}`, { method, headers });

describe("createRpcFetch", () => {
  test("GET と書いた手続きを GET で呼んだ場合、実行して Cache-Control を付けること", async () => {
    const { client, responses } = createClient("GET");

    expect(await client.read()).toBe("read");
    expect(responses[0]?.headers.get("Cache-Control")).toBe("private, no-store");
  });

  test("GET と書いていない手続きを GET で呼んだ場合、弾いて実行しないこと", async () => {
    const { client } = createClient("GET");

    const error = await client.write().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ORPCError);
    expect((error as ORPCError<string, unknown>).code).toBe("METHOD_NOT_SUPPORTED");
    expect(calls).not.toHaveBeenCalled();
  });

  test("DELETE と書いた手続きを DELETE で呼んだ場合、実行すること", async () => {
    const { client } = createClient("DELETE");

    expect(await client.remove()).toBe("remove");
  });

  test.each([
    ["ほかのサイトから", { "Sec-Fetch-Site": "cross-site" }],
    ["同じオリジンから", { "Sec-Fetch-Site": "same-origin" }],
  ])("%s HEAD で呼んだ場合、405 で断って実行しないこと", async (_, headers) => {
    const responses = await Promise.all(
      ["read", "write", "remove"].map((path) => rpcFetch(request(path, "HEAD", headers))),
    );

    expect(responses.map((response) => response?.status)).toEqual([405, 405, 405]);
    expect(calls).not.toHaveBeenCalled();
  });

  test("router に無い手続きの場合、undefined を返すこと", async () => {
    expect(await rpcFetch(request("unknown", "POST", {}))).toBeUndefined();
  });

  describe("ほかのサイトからの書き込みの場合", () => {
    test.each([
      ["POST", "write", { "Sec-Fetch-Site": "cross-site" }],
      ["DELETE", "remove", { "Sec-Fetch-Site": "cross-site" }],
      ["POST", "write", { "Sec-Fetch-Site": "same-site" }],
      ["POST", "write", { Origin: "https://evil.example" }],
      ["DELETE", "remove", { Origin: "https://evil.example" }],
    ])("%s（%s）を %o で送ると、403 で弾いて実行しないこと", async (method, path, headers) => {
      const response = await rpcFetch(request(path, method, headers));

      expect(response?.status).toBe(403);
      expect(calls).not.toHaveBeenCalled();
    });
  });

  describe("ほかのサイトからでない書き込みの場合", () => {
    test.each([
      ["同じオリジンのページから", { "Sec-Fetch-Site": "same-origin", Origin: ORIGIN }],
      ["アドレスバーなど、人の操作から", { "Sec-Fetch-Site": "none" }],
      ["Sec-Fetch-Site を付けないブラウザの、同じオリジンのページから", { Origin: ORIGIN }],
      ["ヘッダーを付けない、ブラウザでないクライアントから", {}],
    ])("%s送ると、実行すること", async (_, headers) => {
      const { client } = createClient("POST", headers);

      expect(await client.write()).toBe("write");
    });
  });

  test("ほかのサイトからの GET の場合、実行すること", async () => {
    const { client } = createClient("GET", { "Sec-Fetch-Site": "cross-site" });

    expect(await client.read()).toBe("read");
  });
});
