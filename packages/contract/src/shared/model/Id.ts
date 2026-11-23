import * as v from "valibot";

// UUIDv7 の小文字だけを通す。大文字も通すと 1 つの ID に書き方が 2 つでき、=== で比べたときに別の ID になる
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

export const IdSchema = v.pipe(v.string(), v.regex(UUID_V7));
export type Id = v.InferOutput<typeof IdSchema>;
