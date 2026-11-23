import * as v from "valibot";

// 日時は Date のまま運ぶ。oRPC の RPC の通信が Date を Date に戻すので、文字列との変換を書かない
export const DateTimeSchema = v.date();
export type DateTime = v.InferOutput<typeof DateTimeSchema>;
