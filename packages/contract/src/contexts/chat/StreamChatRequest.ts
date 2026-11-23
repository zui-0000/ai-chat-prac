import * as v from "valibot";

import { ChatPromptSchema } from "./model";

export const StreamChatRequestSchema = v.object({
  prompt: ChatPromptSchema,
});
export type StreamChatRequest = v.InferOutput<typeof StreamChatRequestSchema>;
