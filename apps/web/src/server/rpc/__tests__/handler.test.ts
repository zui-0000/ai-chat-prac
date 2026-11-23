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
  replace: os.route({ method: "PUT" }).handler(() => {
    calls("replace");
    return "replace";
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

type CrossSiteCase = { method: string; path: string; header: string; value: string };
type SameSiteCase = { from: string; site: string | undefined; origin: string | undefined };

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

  test.each`
    from              | site
    ${"ほかのサイト"} | ${"cross-site"}
    ${"同じオリジン"} | ${"same-origin"}
  `(
    "「$from」から HEAD で呼んだ場合、405 で断って実行しないこと",
    async ({ site }: { from: string; site: string }) => {
      const responses = await Promise.all(
        ["read", "write", "replace", "remove"].map((path) =>
          rpcFetch(request(path, "HEAD", { "Sec-Fetch-Site": site })),
        ),
      );

      expect(responses.map((response) => response?.status)).toEqual([405, 405, 405, 405]);
      expect(calls).not.toHaveBeenCalled();
    },
  );

  test("router に無い手続きの場合、undefined を返すこと", async () => {
    expect(await rpcFetch(request("unknown", "POST", {}))).toBeUndefined();
  });

  test.each`
    method      | path         | header              | value
    ${"POST"}   | ${"write"}   | ${"Sec-Fetch-Site"} | ${"cross-site"}
    ${"PUT"}    | ${"replace"} | ${"Sec-Fetch-Site"} | ${"cross-site"}
    ${"DELETE"} | ${"remove"}  | ${"Sec-Fetch-Site"} | ${"cross-site"}
    ${"POST"}   | ${"write"}   | ${"Sec-Fetch-Site"} | ${"same-site"}
    ${"POST"}   | ${"write"}   | ${"Origin"}         | ${"https://evil.example"}
    ${"DELETE"} | ${"remove"}  | ${"Origin"}         | ${"https://evil.example"}
  `(
    "$method で $header が $value の場合、403 で弾いて実行しないこと",
    async ({ method, path, header, value }: CrossSiteCase) => {
      const response = await rpcFetch(request(path, method, { [header]: value }));

      expect(response?.status).toBe(403);
      expect(calls).not.toHaveBeenCalled();
    },
  );

  test.each`
    from                                                           | site             | origin
    ${"同じオリジンのページ"}                                      | ${"same-origin"} | ${ORIGIN}
    ${"アドレスバーなどの、人の操作"}                              | ${"none"}        | ${undefined}
    ${"Sec-Fetch-Site を付けないブラウザの、同じオリジンのページ"} | ${undefined}     | ${ORIGIN}
    ${"ヘッダーを付けない、ブラウザでないクライアント"}            | ${undefined}     | ${undefined}
  `("「$from」から書き込んだ場合、実行すること", async ({ site, origin }: SameSiteCase) => {
    const { client } = createClient("POST", {
      ...(site !== undefined && { "Sec-Fetch-Site": site }),
      ...(origin !== undefined && { Origin: origin }),
    });

    expect(await client.write()).toBe("write");
  });

  test("ほかのサイトからの GET の場合、実行すること", async () => {
    const { client } = createClient("GET", { "Sec-Fetch-Site": "cross-site" });

    expect(await client.read()).toBe("read");
  });
});
