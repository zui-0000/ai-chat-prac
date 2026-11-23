import { eventIterator, oc } from "@orpc/contract";
import * as v from "valibot";

import { AiFailedError } from "../../shared/errors/ai-failed";
import { BadRequestError } from "../../shared/errors/bad-request";
import { UnauthorizedError } from "../../shared/errors/unauthorized";

// 返答を少しずつ返す
export const streamChat = oc
  .input(v.object({ prompt: v.pipe(v.string(), v.minLength(1)) }))
  .output(eventIterator(v.object({ delta: v.string() })))
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
    AI_FAILED: AiFailedError,
  });

export const chatContract = {
  stream: streamChat,
};
