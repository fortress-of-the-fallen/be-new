import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { buildDefaultTutorialProgress } from './tutorial-progress.constant';
import { TutorialProgressService } from './tutorial-progress.service';

describe('TutorialProgressService', () => {
   let service: TutorialProgressService;

   beforeEach(() => {
      service = new TutorialProgressService({} as PrismaService);
   });

   it('builds new-account defaults with only legacy flags enabled', () => {
      const tutorialProgress = buildDefaultTutorialProgress(new Date('2026-05-07T00:00:00.000Z'));

      expect(tutorialProgress.finishOnboarding).toBe(false);
      expect(tutorialProgress.finishFirstDeploy).toBe(false);
      expect(tutorialProgress.isDoneUpgradeUnitTutorial).toBe(false);
      expect(tutorialProgress.finishFirstBattle).toBe(true);
   });

   it('normalizes away invalid active flags when no real progress exists', () => {
      const tutorialProgress = service.normalize(
         {
            finishOnboarding: false,
            finishFirstDeploy: true,
            isDoneUpgradeUnitTutorial: true,
            updatedAt: '2026-05-07T00:00:00.000Z',
         },
         {
            stageCampaign: 1,
            battlesWon: 0,
            battlesPlayed: 0,
            level: 1,
            exp: 0,
         },
         new Date('2026-05-07T00:00:00.000Z'),
         [{ customData: { lv: '1' } }],
      );

      expect(tutorialProgress.finishOnboarding).toBe(false);
      expect(tutorialProgress.finishFirstDeploy).toBe(false);
      expect(tutorialProgress.isDoneUpgradeUnitTutorial).toBe(false);
   });

   it('does not auto-complete onboarding for a new account with explicit false flag', () => {
      const tutorialProgress = service.normalize(
         {
            finishOnboarding: false,
            updatedAt: '2026-05-07T00:00:00.000Z',
         },
         {
            stageCampaign: 1,
            battlesWon: 0,
            battlesPlayed: 0,
            level: 1,
            exp: 15,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      expect(tutorialProgress.finishOnboarding).toBe(false);
      expect(tutorialProgress.finishFirstDeploy).toBe(false);
   });

   it('infers tutorial battle 2 completion from progressed campaign state', () => {
      const tutorialProgress = service.normalize(
         {},
         {
            stageCampaign: 3,
            battlesWon: 2,
            battlesPlayed: 2,
            level: 2,
            exp: 20,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      expect(tutorialProgress.finishOnboarding).toBe(true);
      expect(tutorialProgress.finishFirstDeploy).toBe(true);
   });

   it('advances PVE tutorial progress one active flag at a time', () => {
      const afterFirstWin = service.applyPveBattleWin(
         buildDefaultTutorialProgress(new Date('2026-05-07T00:00:00.000Z')),
         {
            stageCampaign: 1,
            battlesWon: 0,
            battlesPlayed: 0,
            level: 1,
            exp: 0,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      const firstState = service.normalize(
         afterFirstWin.storedTutorialProgress,
         {
            stageCampaign: 2,
            battlesWon: 1,
            battlesPlayed: 1,
            level: 1,
            exp: 0,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      expect(firstState.finishOnboarding).toBe(true);
      expect(firstState.finishFirstDeploy).toBe(false);

      const afterSecondWin = service.applyPveBattleWin(
         afterFirstWin.storedTutorialProgress,
         {
            stageCampaign: 2,
            battlesWon: 1,
            battlesPlayed: 1,
            level: 1,
            exp: 0,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      const secondState = service.normalize(
         afterSecondWin.storedTutorialProgress,
         {
            stageCampaign: 3,
            battlesWon: 2,
            battlesPlayed: 2,
            level: 1,
            exp: 0,
         },
         new Date('2026-05-07T00:00:00.000Z'),
      );

      expect(secondState.finishOnboarding).toBe(true);
      expect(secondState.finishFirstDeploy).toBe(true);
   });

   it('rejects legacy tutorial fields and invalid upgrade completion patches', async () => {
      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue({
               id: 'p_1',
               statistics: {
                  stageCampaign: 1,
                  battlesWon: 0,
                  battlesPlayed: 0,
                  level: 1,
                  exp: 0,
               },
               tutorialProgress: buildDefaultTutorialProgress(new Date('2026-05-07T00:00:00.000Z')),
               updatedAt: new Date('2026-05-07T00:00:00.000Z'),
            }),
            update: jest.fn(),
         },
         playerInventoryItem: {
            findMany: jest.fn().mockResolvedValue([{ customData: { lv: '1' } }]),
         },
      };

      await expect(
         service.updateTutorialProgress({
            playerId: 'p_1',
            updates: {
               finishFirstBattle: true,
            },
            db,
         }),
      ).rejects.toMatchObject({
         status: HttpStatus.BAD_REQUEST,
      });

      await expect(
         service.updateTutorialProgress({
            playerId: 'p_1',
            updates: {
               isDoneUpgradeUnitTutorial: true,
            },
            db,
         }),
      ).rejects.toMatchObject({
         status: HttpStatus.BAD_REQUEST,
      });
   });
});
