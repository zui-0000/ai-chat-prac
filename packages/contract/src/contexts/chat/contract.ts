import { eventIterator, oc } from "@orpc/contract";

import { AiFailedError } from "../../shared/errors/AiFailedError";
import { BadRequestError } from "../../shared/errors/BadRequestError";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { StreamChatRequestSchema } from "./StreamChatRequest";
import { StreamChatResponseSchema } from "./StreamChatResponse";

export const streamChat = oc
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
