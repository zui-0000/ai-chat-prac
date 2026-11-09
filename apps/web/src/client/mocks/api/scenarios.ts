import type { HttpHandler } from "msw";

import { orpcHandler, type OrpcRouter } from "#/client/mocks/utils/orpc-handler.ts";

import { scenarios as chatStream } from "./chat/stream/scenarios";
import { scenarios as messageCreate } from "./message/create/scenarios";
import { scenarios as messageList } from "./message/list/scenarios";

// 名前に API を付けるので、別の API で同じ状態の名前（error など）を使っても重ならない
const named = <Api extends string, Scenarios extends Record<string, unknown>>(
  api: Api,
  scenarios: Scenarios,
  toRouter: (implementation: Scenarios[keyof Scenarios]) => OrpcRouter,
) =>
  Object.fromEntries(
    Object.entries(scenarios).map(([state, implementation]) => [
      `${api}.${state}`,
      orpcHandler(toRouter(implementation as Scenarios[keyof Scenarios])),
    ]),
  ) as { [State in keyof Scenarios & string as `${Api}.${State}`]: HttpHandler };

// 各 API のシナリオを「<API>.<状態>」の名前で集める。画面では ?scenario=<名前>、テストでは server.use(scenarios[名前]) で使う
export const scenarios = {
  ...named("message.list", messageList, (list) => ({ message: { list } })),
  ...named("message.create", messageCreate, (create) => ({ message: { create } })),
  ...named("chat.stream", chatStream, (stream) => ({ chat: { stream } })),
};

export type ScenarioName = keyof typeof scenarios;
