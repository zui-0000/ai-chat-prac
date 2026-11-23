import { ORPCError, ValidationError } from "@orpc/contract";
import * as v from "valibot";

// 返すのは不正だったフィールドの名前だけ（入力がまるごと違うときは空の文字）。検査のライブラリが作る文言には、送られた値が入る
const BadRequestDataSchema = v.object({
  errors: v.array(v.object({ field: v.string() })),
});
export type BadRequestData = v.InferOutput<typeof BadRequestDataSchema>;

export const BadRequestError = {
  message: "入力が正しくありません",
  data: BadRequestDataSchema,
} as const;

// oRPC の入力の検査のエラーなら、BAD_REQUEST に渡す data を返す。ほかのエラーなら undefined を返す。
// oRPC がそのまま返す入力のエラーには、送られた値と検査の正規表現が入るので、本物の BE と偽物の BE がこれで作り直す
export const toBadRequestData = (error: unknown): BadRequestData | undefined => {
  if (
    !(error instanceof ORPCError) ||
    error.code !== "BAD_REQUEST" ||
    !(error.cause instanceof ValidationError)
  ) {
    return undefined;
  }

  // 入力がまるごと違う（オブジェクトでない、など）ときは path が無いので、field は空の文字になる
  const fields = new Set<string>();
  for (const issue of error.cause.issues) {
    const segments = issue.path ?? [];
    fields.add(
      segments
        .map((segment) => String(typeof segment === "object" ? segment.key : segment))
        .join("."),
    );
  }
  return { errors: [...fields].map((field) => ({ field })) };
};
