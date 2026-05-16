import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Seeder } from 'src/shared/decorator/seeder.decorator';

@Seeder()
@Injectable()
export class MongoSchemaSeeding {
   private readonly logger = new Logger(MongoSchemaSeeding.name);

   constructor(private readonly prisma: PrismaService) {}

   async seed() {
      const collectionIndexes: Array<{
         collection: string;
         indexes: Array<Record<string, any>>;
      }> = [
         {
            collection: 'accounts',
            indexes: [
               { key: { username: 1 }, name: 'accounts_username_unique', unique: true },
               { key: { playerId: 1 }, name: 'accounts_player_id_unique', unique: true, sparse: true },
            ],
         },
         {
            collection: 'refresh_tokens',
            indexes: [
               { key: { accountId: 1 }, name: 'refresh_tokens_account_id_idx' },
               { key: { playerId: 1 }, name: 'refresh_tokens_player_id_idx' },
               {
                  key: { expiresAt: 1 },
                  name: 'refresh_tokens_expires_at_ttl',
                  expireAfterSeconds: 0,
               },
               { key: { tokenHash: 1 }, name: 'refresh_tokens_token_hash_unique', unique: true },
            ],
         },
         {
            collection: 'players',
            indexes: [
               { key: { accountId: 1 }, name: 'players_account_id_unique', unique: true },
               { key: { 'profile.displayName': 1 }, name: 'players_profile_display_name_idx' },
               { key: { 'statistics.score': -1 }, name: 'players_statistics_score_desc_idx' },
               { key: { 'statistics.level': -1 }, name: 'players_statistics_level_desc_idx' },
               {
                  key: { 'statistics.stageCampaign': -1 },
                  name: 'players_statistics_stage_campaign_desc_idx',
               },
               {
                  key: { 'tutorialProgress.finishOnboarding': 1 },
                  name: 'players_tutorial_progress_finish_onboarding_idx',
               },
            ],
         },
         {
            collection: 'player_inventory_items',
            indexes: [
               { key: { playerId: 1, itemType: 1 }, name: 'player_inventory_items_player_type_idx' },
               { key: { playerId: 1, itemId: 1 }, name: 'player_inventory_items_player_item_idx' },
               {
                  key: { playerId: 1, _id: 1 },
                  name: 'player_inventory_items_player_id_unique',
                  unique: true,
               },
            ],
         },
         {
            collection: 'player_formations',
            indexes: [
               { key: { playerId: 1, name: 1 }, name: 'player_formations_player_name_unique', unique: true },
            ],
         },
         {
            collection: 'player_quests',
            indexes: [
               {
                  key: { playerId: 1, questId: 1, periodKey: 1 },
                  name: 'player_quests_player_quest_period_unique',
                  unique: true,
               },
               {
                  key: { playerId: 1, type: 1, periodKey: 1 },
                  name: 'player_quests_player_type_period_idx',
               },
            ],
         },
         {
            collection: 'player_quest_progress_rewards',
            indexes: [
               {
                  key: { playerId: 1, track: 1, stage: 1, periodKey: 1 },
                  name: 'player_quest_progress_rewards_player_track_stage_period_unique',
                  unique: true,
               },
               {
                  key: { playerId: 1, track: 1, periodKey: 1 },
                  name: 'player_quest_progress_rewards_player_track_period_idx',
               },
            ],
         },
         {
            collection: 'battle_sessions',
            indexes: [
               { key: { playerId: 1, startedAt: -1 }, name: 'battle_sessions_player_started_desc_idx' },
               { key: { status: 1, expiresAt: 1 }, name: 'battle_sessions_status_expires_idx' },
               { key: { opponentPlayerId: 1 }, name: 'battle_sessions_opponent_player_idx' },
            ],
         },
         {
            collection: 'reward_transactions',
            indexes: [
               { key: { playerId: 1, createdAt: -1 }, name: 'reward_transactions_player_created_desc_idx' },
               {
                  key: { playerId: 1, idempotencyKey: 1 },
                  name: 'reward_transactions_player_idempotency_unique',
                  unique: true,
                  sparse: true,
               },
               { key: { sourceType: 1, sourceId: 1 }, name: 'reward_transactions_source_idx' },
            ],
         },
         {
            collection: 'leaderboard_scores',
            indexes: [
               { key: { playerId: 1, type: 1 }, name: 'leaderboard_scores_player_type_unique', unique: true },
               { key: { type: 1, score: -1 }, name: 'leaderboard_scores_type_score_desc_idx' },
            ],
         },
         {
            collection: 'configs',
            indexes: [
               { key: { name: 1, version: 1 }, name: 'configs_name_version_unique', unique: true },
               { key: { name: 1, isActive: 1 }, name: 'configs_name_active_idx' },
            ],
         },
         {
            collection: 'idempotency_records',
            indexes: [
               {
                  key: { playerId: 1, idempotencyKey: 1 },
                  name: 'idempotency_records_player_key_unique',
                  unique: true,
               },
               { key: { playerId: 1, createdAt: -1 }, name: 'idempotency_records_player_created_desc_idx' },
            ],
         },
      ];

      for (const definition of collectionIndexes) {
         await (this.prisma as any).$runCommandRaw({
            createIndexes: definition.collection,
            indexes: definition.indexes,
         });
      }

      this.logger.log('Mongo indexes ensured for server-authoritative collections');
   }
}
