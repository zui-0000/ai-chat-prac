import * as v from "valibot";

import { MessageCreatedAtSchema } from "./model/MessageCreatedAt";
import { MessageIdSchema } from "./model/MessageId";
import { MessageTextSchema } from "./model/MessageText";

// 一覧の 1 件
export const ListMessagesResultSchema = v.object({
  id: MessageIdSchema,
  text: MessageTextSchema,
  createdAt: MessageCreatedAtSchema,
});
export type ListMessagesResult = v.InferOutput<typeof ListMessagesResultSchema>;
