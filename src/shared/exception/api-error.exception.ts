import { HttpException, HttpStatus } from '@nestjs/common';

type ApiErrorResponseBody = {
   code: string;
   message: string;
   details?: unknown;
};

export class ApiErrorException extends HttpException {
   constructor(
      status: HttpStatus,
      code: string,
      message: string,
      details: unknown = {},
   ) {
      super(
         {
            code,
            message,
            details,
         } satisfies ApiErrorResponseBody,
         status,
      );
   }
}
