class DataAccessException extends Error {
   constructor(message: string) {
      super(message);
   }
}

class DocumentIsLockedException extends DataAccessException {
   constructor(message?: string) {
      super(message ?? '');
   }
}

class DocumentIsDeletedException extends DataAccessException {
   constructor(message?: string) {
      super(message ?? '');
   }
}

export { DataAccessException, DocumentIsLockedException, DocumentIsDeletedException };
