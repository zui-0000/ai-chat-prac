import { os } from "~/client/mocks/utils/orpc-implementer";

import { addMessage } from "../data";

export const handler = os.message.create.handler(({ input }) => addMessage(input.text));
