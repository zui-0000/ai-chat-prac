import { oc } from "@orpc/contract";

import { BadRequestError } from "./errors/bad-request";
import { UnauthorizedError } from "./errors/unauthorized";

// 手続きは oc ではなく、ここから作る。どの手続きにも、未ログインと入力の誤りのエラーが付く
export const base = oc.errors({
  UNAUTHORIZED: UnauthorizedError,
  BAD_REQUEST: BadRequestError,
});
