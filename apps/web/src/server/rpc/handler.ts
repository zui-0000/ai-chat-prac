import { HttpMethod } from "@ai-chat/contract";
import { RPCHandler } from "@orpc/server/fetch";

type Router = ConstructorParameters<typeof RPCHandler>[0];

// 契約で使うメソッド。受け口（middleware/01.rpc.ts）にはどのメソッドも届くので、ここで絞る
const ALLOWED_METHODS: readonly string[] = [
  HttpMethod.GET,
  HttpMethod.POST,
  HttpMethod.PUT,
  HttpMethod.PATCH,
  HttpMethod.DELETE,
];

// ほかのサイトのページから送られた書き込みかを、ブラウザが付けるヘッダーで見分ける。
// ブラウザでないクライアントはどちらのヘッダーも付けないので通す（クッキーを勝手に付けて送るのはブラウザだけ）
const isCrossSiteWrite = (request: Request) => {
  if (request.method === HttpMethod.GET) return false;

  const site = request.headers.get("Sec-Fetch-Site");
  if (site !== null) return site !== "same-origin" && site !== "none";

  // Sec-Fetch-Site を付けない古いブラウザ
  const origin = request.headers.get("Origin");
  return origin !== null && origin !== new URL(request.url).origin;
};

// /rpc に来たリクエストを oRPC に渡す関数を作る。router にない手続きなら undefined を返す。
// RPCHandler の StrictGetMethodPlugin は最初から入っていて、契約で GET の印を付けた手続きだけを GET で呼べる
export const createRpcFetch = (router: Router) => {
  const handler = new RPCHandler(router);

  return async (request: Request): Promise<Response | undefined> => {
    // 契約で使わないメソッドは受けない。oRPC は GET のほかのメソッドを区別しないので、
    // そのまま渡すと、HEAD などでも手続きが動く
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(null, { status: 405, headers: { Allow: ALLOWED_METHODS.join(", ") } });
    }

    // 手続きを探す前に弾く。router にない手続きでも 403 になる
    if (isCrossSiteWrite(request)) return new Response("Forbidden", { status: 403 });

    const { matched, response } = await handler.handle(request, { prefix: "/rpc" });
    if (!matched) return undefined;

    // 個人の会話を、ブラウザや CDN にためさせない
    if (request.method === HttpMethod.GET) {
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  };
};
