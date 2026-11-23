import * as v from "valibot";

import { MessageCreatedAtSchema, MessageIdSchema, MessageTextSchema } from "./model";

export const ListMessagesResponseSchema = v.array(
  v.object({
    id: MessageIdSchema,
    text: MessageTextSchema,
    createdAt: MessageCreatedAtSchema,
  }),
);
export type ListMessagesResponse = v.InferOutput<typeof ListMessagesResponseSchema>;
