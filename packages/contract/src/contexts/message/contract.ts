import { oc } from "@orpc/contract";
import * as v from "valibot";

import { HttpMethod } from "../../shared/constants/http-method";
import { BadRequestError } from "../../shared/errors/bad-request";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { MessageSchema } from "./model/message";

export const listMessages = oc
  .route({ method: HttpMethod.GET })
  .output(v.array(MessageSchema))
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
  });

export const createMessage = oc
  .input(v.object({ text: v.pipe(v.string(), v.minLength(1)) }))
  .output(MessageSchema)
  .errors({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED: UnauthorizedError,
  });

export const messageContract = {
  list: listMessages,
  create: createMessage,
};
