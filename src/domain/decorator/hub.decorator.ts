import { Injectable, Scope } from '@nestjs/common';

export const hubs: any[] = [];

export function Hub(): ClassDecorator {
   return (target: any) => {
      Injectable({ scope: Scope.DEFAULT })(target);

      hubs.push(target);
   };
}
