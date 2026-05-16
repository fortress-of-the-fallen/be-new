import { ApiProperty } from '@nestjs/swagger';
import { ExecutionRes } from './execution-res.model';

export class ResultRes<T> extends ExecutionRes {
   @ApiProperty({ type: Object, description: 'Kết quả thực thi' })
   result: T | null;

   constructor(result: T | null = null) {
      super();
      this.result = result;
   }
}
