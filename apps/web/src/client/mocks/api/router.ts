import { orpcHandler } from "~/client/mocks/utils/orpc-handler";
import { os } from "~/client/mocks/utils/orpc-implementer";

import { handler as chatStream } from "./chat/stream/handler";
import { handler as messageCreate } from "./message/create/handler";
import { handler as messageList } from "./message/list/handler";

// 各 API の正常系を集める。約束（os.router）どおりに集めるので、API を作り忘れると型エラーになる
export const router = os.router({
  message: { list: messageList, create: messageCreate },
  chat: { stream: chatStream },
});

// 正常系の MSW のハンドラ。シナリオは、これより前に置いて上書きする
export const handlers = [orpcHandler(router)];
