export type ApiSuccessResponse<T> = {
   success: true;
   data: T;
   serverTime: string;
};

export type ApiErrorPayload = {
   code: string;
   message: string;
   details: unknown;
};

export type ApiErrorResponse = {
   success: false;
   error: ApiErrorPayload;
   serverTime: string;
};

export function buildSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
   return {
      success: true,
      data,
      serverTime: new Date().toISOString(),
   };
}

export function buildErrorResponse(
   code: string,
   message: string,
   details: unknown = {},
): ApiErrorResponse {
   return {
      success: false,
      error: {
         code,
         message,
         details,
      },
      serverTime: new Date().toISOString(),
   };
}
