import * as v from "valibot";

import { ChatDeltaSchema } from "./model/chat-delta";

// 少しずつ返す返答の 1 かけら
export const StreamChatResponseSchema = v.object({
  delta: ChatDeltaSchema,
});
export type StreamChatResponse = v.InferOutput<typeof StreamChatResponseSchema>;
