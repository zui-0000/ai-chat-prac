import { resetMockData, server } from "#/client/mocks/node.ts";

// beforeAll では遅い。RPCLink は作られたときの fetch を覚えるので、MSW が差し替える前に作られると MSW を通らない
server.listen({ onUnhandledFrame: "error" });

afterEach(() => {
  server.resetHandlers();
  resetMockData();
});

afterAll(() => server.close());
