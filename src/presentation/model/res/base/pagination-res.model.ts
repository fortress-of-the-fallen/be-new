import { BaseRes } from './base-res.model';

export class PaginationRes extends BaseRes {
   totalItems: number = 0;
   totalPages: number = 1;
   pageNumber: number = 1;
   pageSize: number = 10;
   currentCount: number = 0;

   constructor(totalCount: number, currentCount: number, skip: number = 0, take: number = 10) {
      super();
      this.totalItems = totalCount;
      this.currentCount = currentCount || 0;
      this.pageSize = take ?? totalCount;

      if (this.pageSize === 0) return;

      const remain = totalCount % this.pageSize !== 0 ? 1 : 0;
      this.totalPages = Math.floor(totalCount / this.pageSize) + remain;
      this.pageNumber = (skip ?? 0) / this.pageSize + 1;
   }
}
