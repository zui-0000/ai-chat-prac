import { ORPCError, ValidationError } from "@orpc/contract";

import type { BadRequestData } from "../BadRequestError";

// TODO: 置き場所を見直す。本物の BE とモックの BE の両方が読める場所がここしか無いので、契約に置いている
// oRPC の入力の検査のエラーなら、BAD_REQUEST に渡す data を返す。ほかのエラーなら undefined を返す。
// oRPC がそのまま返す入力のエラーには、送られた値と検査の正規表現が入るので、本物の BE とモックの BE がこれで作り直す
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
