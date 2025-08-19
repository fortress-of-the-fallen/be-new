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
  - `sample` → a simple test event that returns user information.
  - `getConnectionId` → returns the client's connection ID.
- Message → receives notifications from the server for actions like login or test events.
- All messages follow the `BroadcastMessage` structure:
  - `event`: the name of the event.
  - `data`: the payload associated with the event.
    - For login messages, `data` includes:
      - `userId`: the ID of the user.

# Error Handling

## Base Error

| ErrorCode              | Description                                      |
| ---------------------- | ------------------------------------------------ |
| Base.Message.Exception | base error, read server log for more information |

# Conclusion

- For more details, refer to the full API reference.
