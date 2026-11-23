import { oc } from "@orpc/contract";

import { HttpMethod } from "../../shared/constants/http-method";
import { BadRequestError } from "../../shared/errors/bad-request";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { CreateMessageRequestSchema } from "./create-message-request";
import { CreateMessageResponseSchema } from "./create-message-response";
import { ListMessagesResponseSchema } from "./list-messages-response";

export const listMessages = oc
  .route({ method: HttpMethod.GET })
  .output(ListMessagesResponseSchema)
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
  });

export const createMessage = oc
  .input(CreateMessageRequestSchema)
  .output(CreateMessageResponseSchema)
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
  });

export const messageContract = {
  list: listMessages,
  create: createMessage,
};
