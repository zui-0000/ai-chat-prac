import { os } from "#/client/mocks/utils/orpcImplementer.ts";

import { listMessages } from "../data";

export const handler = os.message.list.handler(() => listMessages());
