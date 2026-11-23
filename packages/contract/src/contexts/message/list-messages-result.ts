import * as v from "valibot";

import { MessageCreatedAtSchema } from "./model/message-created-at";
import { MessageIdSchema } from "./model/message-id";
import { MessageTextSchema } from "./model/message-text";

// 一覧の 1 件
export const ListMessagesResultSchema = v.object({
  id: MessageIdSchema,
  text: MessageTextSchema,
  createdAt: MessageCreatedAtSchema,
});
export type ListMessagesResult = v.InferOutput<typeof ListMessagesResultSchema>;
