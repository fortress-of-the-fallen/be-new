import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GenderEnum } from 'src/domain/enum/gender.enum';

export class CreateGameUserReq {
    @IsString()
    @IsNotEmpty()
    @AutoMap()
    @ApiProperty({
        example: 'MyCharacter',
        description: 'Character name'
    })
    character_name: string;

    @IsEnum(GenderEnum)
    @IsNotEmpty()
    @AutoMap()
    @ApiProperty({
        enum: GenderEnum,
        example: GenderEnum.Male,
        description: 'Character gender'
    })
    gender: GenderEnum;
}
