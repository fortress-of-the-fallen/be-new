jest.mock('src/features/quest/application', () => ({
   QuestApplicationService: class QuestApplicationService {},
}));

import { QuestController } from './quest.controller';

describe('QuestController', () => {
   it('getQuests delegates playerId', async () => {
      const questApplicationService = { getQuests: jest.fn().mockResolvedValue({ daily: [] }) };
      const controller = new QuestController(questApplicationService as any);

      const result = await controller.getQuests({ playerId: 'p1' } as any);

      expect(questApplicationService.getQuests).toHaveBeenCalledWith('p1');
      expect(result.data).toEqual({ daily: [] });
   });

   it('claimQuest delegates playerId questId and idempotencyKey', async () => {
      const questApplicationService = { claimQuest: jest.fn().mockResolvedValue({ questId: 1 }) };
      const controller = new QuestController(questApplicationService as any);
      const req = { idempotencyKey: 'id-1' } as any;

      const result = await controller.claimQuest({ playerId: 'p1' } as any, 1, req);

      expect(questApplicationService.claimQuest).toHaveBeenCalledWith('p1', 1, 'id-1');
      expect(result.data).toEqual({ questId: 1 });
   });

   it('claimProgressReward delegates playerId track stage and idempotencyKey', async () => {
      const questApplicationService = { claimProgressReward: jest.fn().mockResolvedValue({ stage: 2 }) };
      const controller = new QuestController(questApplicationService as any);
      const req = { idempotencyKey: 'id-2' } as any;

      const result = await controller.claimProgressReward({ playerId: 'p1' } as any, 'daily', 2, req);

      expect(questApplicationService.claimProgressReward).toHaveBeenCalledWith('p1', 'daily', 2, 'id-2');
      expect(result.data).toEqual({ stage: 2 });
   });
});
