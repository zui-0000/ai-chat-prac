import { setupServer } from "msw/node";

import { handlers } from "./api/router";

// テストは mocks の中を、入口のこのファイルからだけ読む
export { scenarios } from "./api/scenarios";
export { resetMockData } from "./api/reset";

// 単体テスト用の偽物の BE。src/client/__setup__/setup.ts が立ち上げる
export const server = setupServer(...handlers);
