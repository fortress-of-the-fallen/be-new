import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Seeder } from 'src/shared/decorator/seeder.decorator';
import { ACTIVE_CONFIG_VERSION, DEFAULT_CONFIGS } from 'src/shared/services/fotf-config.defaults';

@Seeder()
@Injectable()
export class ConfigSeeding {
   constructor(private readonly prisma: PrismaService) {}

   async seed() {
      const prismaClient = this.prisma as any;
      const entries = Object.entries(DEFAULT_CONFIGS) as Array<[string, unknown[]]>;

      for (const [name, records] of entries) {
         const existing = await prismaClient.config.findUnique({
            where: {
               name_version: {
                  name,
                  version: ACTIVE_CONFIG_VERSION,
               },
            },
         });

         if (existing) {
            await prismaClient.config.update({
               where: {
                  id: existing.id,
               },
               data: {
                  isActive: true,
                  records,
                  activatedAt: new Date(),
               },
            });
         } else {
            await prismaClient.config.create({
               data: {
                  name,
                  version: ACTIVE_CONFIG_VERSION,
                  isActive: true,
                  records,
                  activatedAt: new Date(),
               },
            });
         }

         await prismaClient.config.updateMany({
            where: {
               name,
               version: {
                  not: ACTIVE_CONFIG_VERSION,
               },
            },
            data: {
               isActive: false,
            },
         });
      }
   }
}
