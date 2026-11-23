import { chatContract } from "./contexts/chat/contract";
import { messageContract } from "./contexts/message/contract";

export type { ListMessagesResult } from "./contexts/message/ListMessagesResult";
export { HttpMethod } from "./shared/constants/HttpMethod";
export { AiFailedError } from "./shared/errors/AiFailedError";
export type { BadRequestData } from "./shared/errors/BadRequestError";
export { NotFoundError } from "./shared/errors/NotFoundError";
export { toBadRequestData } from "./shared/errors/toBadRequestData";
export { type CreatedAt, CreatedAtSchema } from "./shared/model/CreatedAt";
export { type DateTime, DateTimeSchema } from "./shared/model/DateTime";
export { type Id, IdSchema } from "./shared/model/Id";

// FE と BE の間の API の契約。BE と偽物の BE は implement(contract) で実装し、FE はクライアントの型とメソッドに使う
export const contract = {
  message: messageContract,
  chat: chatContract,
};
