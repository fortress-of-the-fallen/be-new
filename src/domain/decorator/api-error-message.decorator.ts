import 'reflect-metadata';
import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ExecutionRes } from '../../presentation/model/res/base/execution-res.model';

interface ApiErrorMessageOptions {
    status?: number | string;
    description?: string;
}

type ErrorMessageObject = Record<string, string>;

function getMessageDescription(messagePath: string): string {
    return messagePath;
}

function extractMessagesFromObject(messageObject: ErrorMessageObject): string[] {
    return Object.values(messageObject);
}

export function ApiErrorMessage(
    message: string,
    options: ApiErrorMessageOptions = {}
) {
    const { status = 400, description } = options;

    const resolvedDescription = description || message;

    return applyDecorators(
        ApiResponse({
            status: status as any,
            description: `Error: ${resolvedDescription}`,
        })
    );
}

export function ApiErrorMessages(
    messagesOrObject: Array<{ message: string; status?: number | string }> | ErrorMessageObject,
    options: { status?: number } = {}
) {
    let messages: Array<{ message: string; status?: number | string }> = [];

    if (Array.isArray(messagesOrObject)) {
        messages = messagesOrObject;
    } else {
        const messageStrings = extractMessagesFromObject(messagesOrObject);
        messages = messageStrings.map((message, index) => ({
            message,
            status: options.status || `${400}.${index + 1}`
        }));
    }

    const decorators = messages.map(({ message, status = 400 }) =>
        ApiResponse({
            status: status as any,
            description: message,
        })
    );

    return applyDecorators(...decorators);
}
