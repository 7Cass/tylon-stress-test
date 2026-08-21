import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

import type { ErrorResponse } from "./error.types";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const code = this.mapCode(status);

    let message: string;
    let details: ErrorResponse["details"] | undefined;

    if (isHttp) {
      const res = exception.getResponse();

      // Nest can return string | object.
      if (typeof res === "string") {
        message = res;
      } else if (res && typeof res === "object") {
        const maybeMessage = (res as Record<string, unknown>).message;
        const maybeDetails = (res as Record<string, unknown>).details;

        message =
          typeof maybeMessage === "string"
            ? maybeMessage
            : ("message" in (res as object) ? String(maybeMessage) : "");
        details = maybeDetails as ErrorResponse["details"] | undefined;
      } else {
        message = exception.message;
      }
    } else {
      message = exception instanceof Error ? exception.message : "Unexpected error";
    }

    if (!message) message = "Unexpected error";

    const body: ErrorResponse = {
      status,
      code,
      message,
      ...(details === undefined ? {} : { details }),
    };

    response.status(status).json(body);
  }

  private mapCode(status: number): ErrorResponse["code"] {
    if (status === HttpStatus.BAD_REQUEST) return "BAD_REQUEST";
    if (status === HttpStatus.NOT_FOUND) return "NOT_FOUND";
    if (status === HttpStatus.UNAUTHORIZED) return "UNAUTHORIZED";
    if (status === HttpStatus.FORBIDDEN) return "FORBIDDEN";
    return "INTERNAL_ERROR";
  }
}
