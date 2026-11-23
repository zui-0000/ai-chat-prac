import { eventIterator, oc } from "@orpc/contract";

import { AiFailedError } from "../../shared/errors/ai-failed";
import { BadRequestError } from "../../shared/errors/bad-request";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { StreamChatRequestSchema } from "./stream-chat-request";
import { StreamChatResponseSchema } from "./stream-chat-response";

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
