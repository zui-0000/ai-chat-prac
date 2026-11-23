import * as v from "valibot";

export const MessageCreatedAtSchema = v.string();
export type MessageCreatedAt = v.InferOutput<typeof MessageCreatedAtSchema>;
