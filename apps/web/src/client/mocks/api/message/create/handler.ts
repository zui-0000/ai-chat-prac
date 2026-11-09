import { os } from "#/client/mocks/utils/orpc-implementer.ts";

import { addMessage } from "../data";

export const handler = os.message.create.handler(({ input }) => addMessage(input.text));
