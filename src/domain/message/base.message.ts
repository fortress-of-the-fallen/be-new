class BaseMessage {
   static readonly EXCEPTION = 'Base.Message.Exception';
   static readonly TOO_MANY_REQUESTS = 'Base.Message.TooManyRequests';
   static readonly BAD_REQUEST = 'Base.Message.BadRequest';
   static readonly INTERNAL_SERVER_ERROR = 'Base.Message.InternalServerError';
   static readonly UNAUTHORIZED = 'Base.Message.Unauthorized';
   static readonly FORBIDDEN = 'Base.Message.Forbidden';

   static readonly VALIDATION_ERROR = 'Base.Message.ValidationError';

   static readonly DOCUMENT_IS_LOCKED = 'Base.Message.DocumentIsLocked';
   static readonly DOCUMENT_IS_DELETED = 'Base.Message.DocumentIsDeleted';

   static readonly MISSING_USER_AGENT = 'Base.Message.MissingUserAgent';
   static readonly INVALID_HEADER = 'Base.Message.InvalidHeader';
}

export { BaseMessage };
