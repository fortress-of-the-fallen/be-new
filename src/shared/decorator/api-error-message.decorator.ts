import 'reflect-metadata';
import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ExecutionRes } from '../../api/model/res/base/execution-res.model';

/**
 * Options for documenting a single API error response.
 */
interface ApiErrorMessageOptions {
   status?: number | string;
   description?: string;
}

/**
 * A key-value object that maps error identifiers to message strings.
 */
type ErrorMessageObject = Record<string, string>;

/**
 * Resolves a message path into a human-readable description.
 */
function getMessageDescription(messagePath: string): string {
   return messagePath;
}

/**
 * Extracts all message values from a keyed message object.
 */
function extractMessagesFromObject(messageObject: ErrorMessageObject): string[] {
   return Object.values(messageObject);
}

/**
 * Creates a Swagger error response decorator for a single error message.
 */
export function ApiErrorMessage(message: string, options: ApiErrorMessageOptions = {}) {
   const { status = 400, description } = options;

   const resolvedDescription = description || message;

   return applyDecorators(
      ApiResponse({
         status: status as any,
         description: `Error: ${resolvedDescription}`,
      }),
   );
}

/**
 * Creates multiple Swagger error response decorators from either a list or an object map.
 */
export function ApiErrorMessages(
   messagesOrObject: Array<{ message: string; status?: number | string }> | ErrorMessageObject,
   options: { status?: number } = {},
) {
   let messages: Array<{ message: string; status?: number | string }> = [];

   if (Array.isArray(messagesOrObject)) {
      messages = messagesOrObject;
   } else {
      const messageStrings = extractMessagesFromObject(messagesOrObject);
      messages = messageStrings.map((message, index) => ({
         message,
         status: options.status || `${400}.${index + 1}`,
      }));
   }

   const decorators = messages.map(({ message, status = 400 }) =>
      ApiResponse({
         status: status as any,
         description: message,
      }),
   );

   return applyDecorators(...decorators);
}
