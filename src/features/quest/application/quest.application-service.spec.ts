import { QuestApplicationService } from './quest.application-service';

describe('QuestApplicationService', () => {
   it('delegates quest reads and claims', async () => {
      const getQuestsApplicationService = { getQuests: jest.fn().mockResolvedValue({ daily: [] }) };
      const claimQuestApplicationService = { claim: jest.fn().mockResolvedValue({ questId: 1 }) };
      const claimProgressRewardApplicationService = { claim: jest.fn().mockResolvedValue({ stage: 2 }) };
      const service = new QuestApplicationService(
         getQuestsApplicationService as any,
         claimQuestApplicationService as any,
         claimProgressRewardApplicationService as any,
      );

      await expect(service.getQuests('p1')).resolves.toEqual({ daily: [] });
      await expect(service.claimQuest('p1', 1, 'id-1')).resolves.toEqual({ questId: 1 });
      await expect(service.claimProgressReward('p1', 'daily', 2, 'id-2')).resolves.toEqual({ stage: 2 });

      expect(getQuestsApplicationService.getQuests).toHaveBeenCalledWith('p1');
      expect(claimQuestApplicationService.claim).toHaveBeenCalledWith('p1', 1, 'id-1');
      expect(claimProgressRewardApplicationService.claim).toHaveBeenCalledWith('p1', 'daily', 2, 'id-2');
   });
});
