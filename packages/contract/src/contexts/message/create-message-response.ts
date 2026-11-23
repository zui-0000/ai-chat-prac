import * as v from "valibot";

import { MessageCreatedAtSchema } from "./model/message-created-at";
import { MessageIdSchema } from "./model/message-id";
import { MessageTextSchema } from "./model/message-text";

export const CreateMessageResponseSchema = v.object({
  id: MessageIdSchema,
  text: MessageTextSchema,
  createdAt: MessageCreatedAtSchema,
});
export type CreateMessageResponse = v.InferOutput<typeof CreateMessageResponseSchema>;
