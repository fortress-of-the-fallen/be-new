import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsHexColor, IsNotEmpty, IsString } from 'class-validator';
import { GenderEnum } from 'src/features/character/application/gender.enum';

export class CreateCharacterReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'MyCharacter',
      description: 'Tên hiển thị của nhân vật khi tạo mới. Bắt buộc, không được rỗng.',
   })
   character_name: string;

   @IsEnum(GenderEnum)
   @IsNotEmpty()
   @ApiProperty({
      enum: GenderEnum,
      example: GenderEnum.Male,
      description: 'Giới tính nhân vật. Hiện tại nhận giá trị theo enum GenderEnum.',
   })
   gender: GenderEnum;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'human',
      description:
         'Chủng tộc nhân vật dưới dạng chuỗi (string). Không còn ràng buộc enum ở API layer. Ví dụ: "human".',
   })
   race: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'ShortWavy',
      description: 'Khóa kiểu tóc (appearance key) dùng để map sang dữ liệu asset/avatar.',
   })
   hair: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'TrimGoatee',
      description: 'Khóa kiểu râu (appearance key) dùng để map sang dữ liệu asset/avatar.',
   })
   beard: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'RoundSharp',
      description: 'Khóa kiểu mắt (appearance key) dùng để map sang dữ liệu asset/avatar.',
   })
   eye: string;

   @IsHexColor()
   @ApiProperty({
      example: '#4A2C1D',
      description: 'Màu tóc ở định dạng HEX, bắt buộc đúng chuẩn mã màu (ví dụ: #4A2C1D).',
   })
   hairColor: string;

   @IsHexColor()
   @ApiProperty({
      example: '#2C1B12',
      description: 'Màu râu ở định dạng HEX, bắt buộc đúng chuẩn mã màu (ví dụ: #2C1B12).',
   })
   beardColor: string;

   @IsHexColor()
   @ApiProperty({
      example: '#3A86FF',
      description: 'Màu mắt ở định dạng HEX, bắt buộc đúng chuẩn mã màu (ví dụ: #3A86FF).',
   })
   eyeColor: string;
}
