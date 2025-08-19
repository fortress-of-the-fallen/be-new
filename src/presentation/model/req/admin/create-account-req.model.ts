import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleBase } from 'src/domain/enum/role-base.enum';

export class CreateAccountReq {
   @IsString()
   @IsNotEmpty()
   @AutoMap()
   @ApiProperty({
      example: 'newuser',
   })
   username: string;

   @IsString()
   @IsNotEmpty()
   @AutoMap()
   @ApiProperty({
      example: 'newuser123',
   })
   password: string;

   @IsString()
   @IsOptional()
   @AutoMap()
   @ApiProperty({
      example: 'New User',
      required: false,
   })
   name?: string;

   @ApiProperty({
      enum: RoleBase,
      isArray: true,
      example: [RoleBase.Admin],
      required: true,
   })
   @Transform(({ value }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').map(v => v.trim());
      return [];
   })
   @IsEnum(RoleBase, { each: true })
   @IsArray()
   role: RoleBase[];
}
