import { resetMockData, server } from "#/client/mocks/node.ts";

// 偽物の BE（MSW）を立ち上げる。beforeAll ではなく、読み込んだ時点で立ち上げる。テストのファイルが読む orpc.ts の RPCLink は、
// 作られたときの fetch を覚えるので、MSW が fetch を差し替える前に作られると MSW を通らない
server.listen({ onUnhandledFrame: "error" });

afterEach(() => {
  server.resetHandlers();
  resetMockData();
});

afterAll(() => server.close());
