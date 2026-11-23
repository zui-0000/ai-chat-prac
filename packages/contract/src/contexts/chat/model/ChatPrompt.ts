import * as v from "valibot";

export const ChatPromptSchema = v.pipe(v.string(), v.minLength(1));
export type ChatPrompt = v.InferOutput<typeof ChatPromptSchema>;
