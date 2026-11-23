import { os } from "#/client/mocks/utils/orpcImplementer.ts";

import { addMessage } from "../data";

export const handler = os.message.create.handler(({ input }) => addMessage(input.text));
