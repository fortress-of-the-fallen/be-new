export class ChannelConstant {
   static readonly CHANNEL_TYPE = {
      PUBLIC: 'public',
      PRIVATE: 'private',
      GROUP: 'group',
   } as const;

   static readonly CHANNEL_TYPE_LIST = Object.values(ChannelConstant.CHANNEL_TYPE);

   static readonly CHANNEL_STATUS = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
   } as const;

   static readonly CHANNEL_STATUS_LIST = Object.values(ChannelConstant.CHANNEL_STATUS);
}
