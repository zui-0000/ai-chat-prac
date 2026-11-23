import * as v from "valibot";

export const MessageIdSchema = v.number();
export type MessageId = v.InferOutput<typeof MessageIdSchema>;
