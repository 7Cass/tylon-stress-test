import type { ErrorCode } from "./error.types";

export type ErrorResponseBody = {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown[] | Record<string, unknown> | string;
};
