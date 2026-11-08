import { os } from "~/client/mocks/utils/orpc-implementer";

import { fakeReply } from "./reply";

export const handler = os.chat.stream.handler(async function* ({ input }) {
  for (const char of fakeReply(input.prompt)) {
    yield { delta: char };
  }
});
