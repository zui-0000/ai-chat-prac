import * as v from "valibot";

import { MessageTextSchema } from "./model";

export const CreateMessageRequestSchema = v.object({
  text: MessageTextSchema,
});
export type CreateMessageRequest = v.InferOutput<typeof CreateMessageRequestSchema>;
