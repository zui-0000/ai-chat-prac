import { chatContract } from "./contexts/chat/contract";
import { messageContract } from "./contexts/message/contract";

export { type Message, MessageSchema } from "./contexts/message/model/message";
export { HttpMethod } from "./shared/constants/http-method";
export { AiFailedError } from "./shared/errors/ai-failed";
export { type BadRequestData, toBadRequestData } from "./shared/errors/bad-request";
export { NotFoundError } from "./shared/errors/not-found";
export { type DateTime, DateTimeSchema } from "./shared/model/date-time";
export { type Id, IdSchema } from "./shared/model/id";

// FE と BE の間の API の契約。BE と偽物の BE は implement(contract) で実装し、FE はクライアントの型とメソッドに使う
export const contract = {
  message: messageContract,
  chat: chatContract,
};
