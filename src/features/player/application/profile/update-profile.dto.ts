export class UpdateProfileDto {
   displayName?: string;
   avatar?: string;
   country?: string;
   idempotencyKey: string;
}
