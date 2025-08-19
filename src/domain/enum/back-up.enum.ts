import { Session } from '../entity/session.entity';
import { User } from '../entity/user.entity';

export enum BackUpEnum {
   User = 'user-backup',
   Session = 'session-backup',
}

export const userToEnumMap = {
   [User.name]: BackUpEnum.User,
   [Session.name]: BackUpEnum.Session,
   default: null,
};

export function getEnum(key: string) {
   return userToEnumMap[key] ?? userToEnumMap.default;
}
