class ValidateException extends Error {
   public validationErrors?: string[];

   constructor(message: string, validationErrors?: string[]) {
      super(message);
      this.name = 'ValidateException';
      this.validationErrors = validationErrors;
   }
}
export { ValidateException };
