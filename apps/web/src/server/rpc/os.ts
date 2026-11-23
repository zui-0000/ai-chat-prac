import { contract, toBadRequestData } from "@ai-chat/contract";
import { implement } from "@orpc/server";

// 手続きの実装の土台。入力の検査のエラーを、契約の BAD_REQUEST に作り直す。
// oRPC がそのまま返す入力のエラーには、送られた値と検査の正規表現が入る。
// 入力は、ここで .use() したミドルウェアのあとに検査される（oRPC の既定）ので、エラーをここで捕まえられる
export const os = implement(contract).use(async ({ next, errors }) => {
  try {
    return await next();
  } catch (error) {
    const data = toBadRequestData(error);
    if (data === undefined) throw error;
    throw errors.BAD_REQUEST({ data });
  }
});
