import { chatContract } from "./contexts/chat";
import { messageContract } from "./contexts/message";

export * from "./contexts/chat";
export * from "./contexts/message";
export * from "./shared/constants";
export * from "./shared/errors";
export * from "./shared/model";

// FE と BE の間の API の契約。BE とモックの BE は implement(contract) で実装し、FE はクライアントの型とメソッドに使う
export const contract = {
  message: messageContract,
  chat: chatContract,
};
