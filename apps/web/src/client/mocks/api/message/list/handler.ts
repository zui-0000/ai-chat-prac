import { os } from "#/client/mocks/utils/orpc-implementer.ts";

import { listMessages } from "../data";

export const handler = os.message.list.handler(() => listMessages());
