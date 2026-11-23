import { HttpStatus } from "../constants";

export const UnauthorizedError = {
  status: HttpStatus.UNAUTHORIZED,
  message: "ログインが必要です",
} as const;
