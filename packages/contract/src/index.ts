import { eventIterator } from "@orpc/contract";
import * as v from "valibot";

import { base } from "./shared/base";
import { AiFailedError } from "./shared/errors/ai-failed";

export { base } from "./shared/base";
export { AiFailedError } from "./shared/errors/ai-failed";
export { type BadRequestData, toBadRequestData } from "./shared/errors/bad-request";
export { NotFoundError } from "./shared/errors/not-found";
export { type DateTime, DateTimeSchema } from "./shared/model/date-time";
export { type Id, IdSchema } from "./shared/model/id";

export const MessageSchema = v.object({
  id: v.number(),
  text: v.string(),
  createdAt: v.string(),
});
export type Message = v.InferOutput<typeof MessageSchema>;

// FE と BE の間の API の約束。FE は型だけを使い、BE は implement(contract) で実装する
export const contract = {
  message: {
    list: base.route({ method: "GET" }).output(v.array(MessageSchema)),
    create: base
      .input(v.object({ text: v.pipe(v.string(), v.minLength(1)) }))
      .output(MessageSchema),
  },
  chat: {
    // 返答を少しずつ返す
    stream: base
      .errors({ AI_FAILED: AiFailedError })
      .input(v.object({ prompt: v.pipe(v.string(), v.minLength(1)) }))
      .output(eventIterator(v.object({ delta: v.string() }))),
  },
};
