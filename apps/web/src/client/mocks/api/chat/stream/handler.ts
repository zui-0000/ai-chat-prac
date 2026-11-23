import { os } from "#/client/mocks/utils/orpcImplementer.ts";

import { mockReply } from "./mockReply";

export const handler = os.chat.stream.handler(async function* ({ input }) {
  for (const char of mockReply(input.prompt)) {
    yield { delta: char };
  }
});
