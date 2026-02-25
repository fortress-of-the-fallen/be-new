import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from 'src/features/character/application/gender.enum';

class CharacterAppearanceRes {
   @ApiProperty({
      example: 'appearance-id-123',
      description: 'ID bản ghi appearance của nhân vật.',
   })
   _id: string;

   @ApiProperty({
      example: 'ShortWavy',
      description: 'Khóa kiểu tóc đã lưu của nhân vật.',
   })
   hair: string;

   @ApiProperty({
      example: 'TrimGoatee',
      description: 'Khóa kiểu râu đã lưu của nhân vật.',
   })
   beard: string;

   @ApiProperty({
      example: 'RoundSharp',
      description: 'Khóa kiểu mắt đã lưu của nhân vật.',
   })
   eye: string;

   @ApiProperty({
      example: '#4A2C1D',
      description: 'Màu tóc ở định dạng HEX.',
   })
   hairColor: string;

   @ApiProperty({
      example: '#2C1B12',
      description: 'Màu râu ở định dạng HEX.',
   })
   beardColor: string;

   @ApiProperty({
      example: '#3A86FF',
      description: 'Màu mắt ở định dạng HEX.',
   })
   eyeColor: string;
}

export class CharacterRes {
   @ApiProperty({
      example: 'character-id-123',
      description: 'ID định danh duy nhất của nhân vật.',
   })
   _id: string;

   @ApiProperty({
      example: 'MyCharacter',
      description: 'Tên hiển thị của nhân vật.',
   })
   character_name: string;

   @ApiProperty({
      example: 'human',
      description: 'Chủng tộc nhân vật ở dạng chuỗi (string). Ví dụ: "human".',
   })
   race: string;

   @ApiProperty({
      enum: GenderEnum,
      example: GenderEnum.Male,
      description: 'Giới tính nhân vật theo enum GenderEnum.',
   })
   gender: GenderEnum;

   @ApiProperty({
      example: 'user-id-123',
      description: 'ID người chơi sở hữu nhân vật (foreign key tới User).',
   })
   userId: string;

   @ApiProperty({
      type: CharacterAppearanceRes,
      nullable: true,
      description: 'Thông tin ngoại hình của nhân vật; có thể null nếu chưa cấu hình.',
   })
   appearance?: CharacterAppearanceRes | null;
}
