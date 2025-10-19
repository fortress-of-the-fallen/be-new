import { Injectable, Scope } from '@nestjs/common';

export const profiles: Array<new (...args: any[]) => unknown> = [];

export function Profile() {
   return function (target: any) {
      Injectable({ scope: Scope.DEFAULT })(target);

      profiles.push(target);
   };
}
