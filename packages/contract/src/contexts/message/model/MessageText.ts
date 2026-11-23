import * as v from "valibot";

export const MessageTextSchema = v.pipe(v.string(), v.minLength(1));
export type MessageText = v.InferOutput<typeof MessageTextSchema>;
