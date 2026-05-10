import { ApiErrorCode } from 'src/api/api-error-code';

class ValidateException extends Error {
   public validationErrors?: string[];
   public errorCode?: ApiErrorCode;

   constructor(message: string, validationErrors?: string[], errorCode?: ApiErrorCode) {
      super(message);
      this.name = 'ValidateException';
      this.validationErrors = validationErrors;
      this.errorCode = errorCode;
   }
}
export { ValidateException };
