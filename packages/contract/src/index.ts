import { eventIterator, oc } from "@orpc/contract";
import * as v from "valibot";

export const MessageSchema = v.object({
  id: v.number(),
  text: v.string(),
  createdAt: v.string(),
});
export type Message = v.InferOutput<typeof MessageSchema>;

// FE と BE の間の API の約束。FE は型だけを使い、BE は implement(contract) で実装する
export const contract = {
  message: {
    list: oc.output(v.array(MessageSchema)),
    create: oc.input(v.object({ text: v.pipe(v.string(), v.minLength(1)) })).output(MessageSchema),
  },
  chat: {
    // 返答を少しずつ返す
    stream: oc
      .input(v.object({ prompt: v.pipe(v.string(), v.minLength(1)) }))
      .output(eventIterator(v.object({ delta: v.string() }))),
  },
};
