import * as v from "valibot";

export const MessageSchema = v.object({
  id: v.number(),
  text: v.string(),
  createdAt: v.string(),
});
export type Message = v.InferOutput<typeof MessageSchema>;
