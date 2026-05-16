import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCharacterReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: '8f7f4b44-5a35-4790-b95a-3ef165179f0a',
      description: 'ID của character cần xóa.',
   })
   characterId: string;
}
