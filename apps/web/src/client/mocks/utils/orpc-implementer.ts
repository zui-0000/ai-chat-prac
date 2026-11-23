import { contract, toBadRequestData } from "@ai-chat/contract";
import { implement } from "@orpc/server";

// 偽物の実装の土台。本物と同じく約束から作るので、返す値が約束とずれると型エラーになる。
// 入力の検査のエラーも、本物と同じく約束の BAD_REQUEST に作り直す
export const os = implement(contract).use(async ({ next, errors }) => {
  try {
    return await next();
  } catch (error) {
    const data = toBadRequestData(error);
    if (data === undefined) throw error;
    throw errors.BAD_REQUEST({ data });
  }
});
