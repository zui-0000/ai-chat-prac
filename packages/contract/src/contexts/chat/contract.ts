import { eventIterator, oc } from "@orpc/contract";

import { HttpMethod } from "#/shared/constants/index.ts";
import { AiFailedError, BadRequestError, UnauthorizedError } from "#/shared/errors/index.ts";

import { StreamChatRequestSchema } from "./StreamChatRequest";
import { StreamChatResponseSchema } from "./StreamChatResponse";

export const streamChat = oc
  .route({ method: HttpMethod.POST })
  .input(StreamChatRequestSchema)
  .output(eventIterator(StreamChatResponseSchema))
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
    AI_FAILED: AiFailedError,
  });

export const chatContract = {
  stream: streamChat,
};
