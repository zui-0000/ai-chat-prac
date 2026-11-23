import { HttpStatus } from "../constants";

export const NotFoundError = {
  status: HttpStatus.NOT_FOUND,
  message: "見つかりませんでした",
} as const;
