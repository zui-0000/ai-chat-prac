import * as v from "valibot";

import { MessageTextSchema } from "./model/MessageText";

export const CreateMessageRequestSchema = v.object({
  text: MessageTextSchema,
});
export type CreateMessageRequest = v.InferOutput<typeof CreateMessageRequestSchema>;
