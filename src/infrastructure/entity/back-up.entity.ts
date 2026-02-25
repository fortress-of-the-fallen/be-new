import { Prop } from '@nestjs/mongoose';
import { Entity } from 'src/shared/decorator/entity.decorator';
import { BackUpEnum } from 'src/infrastructure/background-handler/job/back-up.enum';
import { TimeHelper } from 'src/shared/helper/time.helper';
import { IBaseEntity } from './base/i-base.entity';

@Entity()
export class BackupEntity extends IBaseEntity {
   @Prop({ required: true, enum: BackUpEnum })
   backUpType: BackUpEnum;

   @Prop({ required: true })
   filePath: string;

   @Prop({
      required: true,
      default: () => TimeHelper.getToday(),
   })
   createAt: Date;
}
