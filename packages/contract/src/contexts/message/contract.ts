import { oc } from "@orpc/contract";

import { HttpMethod } from "#/shared/constants/HttpMethod.ts";
import { BadRequestError } from "#/shared/errors/BadRequestError.ts";
import { UnauthorizedError } from "#/shared/errors/UnauthorizedError.ts";

import { CreateMessageRequestSchema } from "./CreateMessageRequest";
import { CreateMessageResponseSchema } from "./CreateMessageResponse";
import { ListMessagesResponseSchema } from "./ListMessagesResponse";

export const listMessages = oc
  .route({ method: HttpMethod.GET })
  .output(ListMessagesResponseSchema)
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
  });

export const createMessage = oc
  .route({ method: HttpMethod.POST })
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
