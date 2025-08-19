# API Documentation

Welcome to API documentation. This document describes the available endpoints, request/response formats, and authentication methods.

- ApiSpec: [link](/)
- Swagger: [link](/swagger)
- Env: [link](https://docs.google.com/spreadsheets/d/1gPHUbUbTPOIgvykkxbRK4BGK1JGbZBNVgmBMmJw6ItI/edit?usp=sharing)

# Broadcast Routes

## BaseHub

- Event `getConnectionId` → returns the client's connection ID.
- Message → receives all server notifications via the `'message'` event.
- All messages follow the `BroadcastMessage` structure:
   - `event`: the name of the event, indicating the type of message.
   - `data`: the payload associated with the event.

## /login

- Namespace: `/login`
- Events:
   - `getConnectionId` → returns the client's connection ID.
- Message → receives notifications from the server for actions like login or test events.
- All messages follow the `BroadcastMessage` structure:
   - `event`: the name of the event.
   - `data`: the payload associated with the event.
      - For login messages, `data` includes:
         - `userId`: the ID of the user.

# Error Handling

## Base Error

| ErrorCode                        | Description                                                |
| -------------------------------- | ---------------------------------------------------------- |
| Base.Message.Exception           | Base error, check server log for more details              |
| Base.Message.TooManyRequests     | The client has sent too many requests in a short time      |
| Base.Message.BadRequest          | The request is invalid or malformed                        |
| Base.Message.InternalServerError | Unexpected server error occurred                           |
| Base.Message.Unauthorized        | The client is not authenticated                            |
| Base.Message.Forbidden           | The client does not have permission to access the resource |
| Base.Message.ValidationError     | Validation failed for request parameters or data           |
| Base.Message.MissingUserAgent    | Required User-Agent header is missing                      |
| Base.Message.InvalidHeader       | One or more headers in the request are invalid             |

# Conclusion

- For more details, refer to the full API reference.
