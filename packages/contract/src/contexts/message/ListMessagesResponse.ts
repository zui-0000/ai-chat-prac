import * as v from "valibot";

import { MessageCreatedAtSchema } from "./model/MessageCreatedAt";
import { MessageIdSchema } from "./model/MessageId";
import { MessageTextSchema } from "./model/MessageText";

export const ListMessagesResponseSchema = v.array(
  v.object({
    id: MessageIdSchema,
    text: MessageTextSchema,
    createdAt: MessageCreatedAtSchema,
  }),
);
export type ListMessagesResponse = v.InferOutput<typeof ListMessagesResponseSchema>;
