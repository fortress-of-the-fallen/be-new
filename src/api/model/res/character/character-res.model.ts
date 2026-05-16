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

export class CharacterStatsRes {
   @ApiProperty({
      example: 'stats-id-123',
      description: 'ID bản ghi stats của nhân vật.',
   })
   _id: string;

   @ApiProperty({ example: 8, description: 'STR (Strength) - chỉ số cơ bản.' })
   str: number;

   @ApiProperty({ example: 8, description: 'DEX (Dexterity) - chỉ số cơ bản.' })
   dex: number;

   @ApiProperty({ example: 8, description: 'CON (Constitution) - chỉ số cơ bản.' })
   con: number;

   @ApiProperty({ example: 8, description: 'INT (Intelligence) - chỉ số cơ bản.' })
   int: number;

   @ApiProperty({ example: 8, description: 'WIS (Wisdom) - chỉ số cơ bản.' })
   wis: number;

   @ApiProperty({ example: 8, description: 'CHA (Charisma) - chỉ số cơ bản.' })
   cha: number;

   @ApiProperty({ example: 0, description: 'Điểm thuộc tính chưa phân bổ.' })
   unspentPoints: number;

   @ApiProperty({ example: 112, description: 'HP suy ra từ base attributes.' })
   hp: number;

   @ApiProperty({ example: 112, description: 'MP suy ra từ base attributes.' })
   mp: number;

   @ApiProperty({ example: 40, description: 'PATK suy ra từ base attributes.' })
   patk: number;

   @ApiProperty({ example: 40, description: 'DATK suy ra từ base attributes.' })
   datk: number;

   @ApiProperty({ example: 40, description: 'MATK suy ra từ base attributes.' })
   matk: number;

   @ApiProperty({ example: 32, description: 'MDEF suy ra từ base attributes.' })
   mdef: number;

   @ApiProperty({ example: 16, description: 'SPD suy ra từ base attributes.' })
   spd: number;

   @ApiProperty({ example: 8, description: 'CRIT suy ra từ base attributes.' })
   crit: number;

   @ApiProperty({ example: 24, description: 'ACC suy ra từ base attributes.' })
   acc: number;

   @ApiProperty({ example: 24, description: 'EVA suy ra từ base attributes.' })
   eva: number;

   @ApiProperty({
      example: 1,
      description: 'Version công thức đã dùng để tính derived stats.',
   })
   formulaVersion: number;
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

   @ApiProperty({
      type: CharacterStatsRes,
      nullable: true,
      description: 'Thông tin chỉ số A/B của nhân vật; có thể null với dữ liệu cũ chưa backfill.',
   })
   stats?: CharacterStatsRes | null;
}
