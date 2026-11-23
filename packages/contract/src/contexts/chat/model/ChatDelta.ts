import * as v from "valibot";

export const ChatDeltaSchema = v.string();
export type ChatDelta = v.InferOutput<typeof ChatDeltaSchema>;
