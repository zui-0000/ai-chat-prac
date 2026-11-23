import * as v from "valibot";

import { MessageTextSchema } from "./model/message-text";

export const CreateMessageRequestSchema = v.object({
  text: MessageTextSchema,
});
export type CreateMessageRequest = v.InferOutput<typeof CreateMessageRequestSchema>;
