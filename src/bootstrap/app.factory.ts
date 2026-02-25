import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { Seeding } from 'src/infrastructure/persistence/seeding/seeding';

export async function createApp(): Promise<INestApplication> {
   const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
   });

   const seeding = await app.resolve(Seeding);
   await seeding.seed();

   return app;
}
