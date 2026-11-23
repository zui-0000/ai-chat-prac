import type { InferContractRouterOutputs } from "@orpc/contract";

import { chatContract, messageContract } from "./contexts";

export { HttpMethod, HttpStatus } from "./shared/constants";
export { AiFailedError, NotFoundError, toBadRequestData, UnauthorizedError } from "./shared/errors";

// FE と BE の間の API の契約。BE とモックの BE は implement(contract) で実装し、FE はクライアントの型とメソッドに使う
export const contract = {
  message: messageContract,
  chat: chatContract,
};

// 手続きごとの出力の型。ContractOutputs["message"]["list"] のように引く
export type ContractOutputs = InferContractRouterOutputs<typeof contract>;
