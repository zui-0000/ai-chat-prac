// FE と BE の間の API の約束。FE は型だけを使い、BE は implement(contract) で実装する
import { eventIterator, oc } from "@orpc/contract";
import * as z from "zod";

export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const contract = {
  message: {
    list: oc.output(z.array(MessageSchema)),
    create: oc.input(z.object({ text: z.string().min(1) })).output(MessageSchema),
  },
  chat: {
    // 返答を少しずつ返す
    stream: oc
      .input(z.object({ prompt: z.string().min(1) }))
      .output(eventIterator(z.object({ delta: z.string() }))),
  },
};
