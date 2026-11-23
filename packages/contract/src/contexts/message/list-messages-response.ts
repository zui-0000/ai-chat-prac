import * as v from "valibot";

import { ListMessagesResultSchema } from "./list-messages-result";

export const ListMessagesResponseSchema = v.array(ListMessagesResultSchema);
export type ListMessagesResponse = v.InferOutput<typeof ListMessagesResponseSchema>;
