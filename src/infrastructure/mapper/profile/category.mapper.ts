import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateCategoryCommandReqDto } from 'src/application/feature/category/command/create-category-command/create-category-command-req.dto';
import { Profile } from 'src/domain/decorator/profile.decorator';
import { CreateCategoryReqModel } from 'src/presentation/model/req/category/create-category-req.model';

@Profile()
export class CategoryMapper extends AutomapperProfile {
   constructor(@InjectMapper() mapper: Mapper) {
      super(mapper);
   }

   override get profile() {
      return (mapper: Mapper) => {
         createMap(mapper, CreateCategoryReqModel, CreateCategoryCommandReqDto);
      };
   }
}
