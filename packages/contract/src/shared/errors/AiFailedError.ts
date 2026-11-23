import { HttpStatus } from "../constants";

export const AiFailedError = {
  status: HttpStatus.BAD_GATEWAY,
  message: "AI が返答できませんでした",
} as const;
