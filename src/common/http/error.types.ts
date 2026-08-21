export type ErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "FORBIDDEN"
  | "UNAUTHORIZED";

export interface ErrorResponseDetails {
  // Optional structured details. We keep it permissive but typed as JSON-like.
  // Controllers/services may provide any shape; runtime payload is not modified.
  [key: string]: unknown;
}

export interface ErrorResponse {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown[] | ErrorResponseDetails | string;
}
