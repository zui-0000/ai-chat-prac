import * as v from "valibot";

import { MessageCreatedAtSchema, MessageIdSchema, MessageTextSchema } from "./model";

export const CreateMessageResponseSchema = v.object({
  id: MessageIdSchema,
  text: MessageTextSchema,
  createdAt: MessageCreatedAtSchema,
});
export type CreateMessageResponse = v.InferOutput<typeof CreateMessageResponseSchema>;
