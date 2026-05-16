import { ApiProperty } from '@nestjs/swagger';
import { BaseRes } from './base-res.model';

export class ExecutionRes extends BaseRes {
   @ApiProperty({ type: Date, description: 'Timestamp of the response' })
   timestamp: Date = new Date();

   @ApiProperty({ type: String, description: 'Error code' })
   errorCode: string = '';

   @ApiProperty({ type: String, description: 'Error message' })
   error: string = '';

   @ApiProperty({ type: Boolean, description: 'Indicates if the operation was successful' })
   success: boolean = true;

   @ApiProperty({
      type: [String],
      description: 'Validation errors of the request',
      required: false,
   })
   validates?: string[];
}
