import type { HTTPMethod } from "@orpc/contract";

export const HttpMethod = {
  GET: "GET",
  HEAD: "HEAD",
  POST: "POST",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const satisfies Record<string, HTTPMethod>;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];
