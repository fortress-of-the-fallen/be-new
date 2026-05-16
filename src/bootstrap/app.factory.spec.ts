jest.mock('@nestjs/core', () => ({
   NestFactory: {
      create: jest.fn(),
   },
}));
jest.mock('src/app.module', () => ({
   AppModule: class AppModule {},
}));
jest.mock('src/infrastructure/persistence/seeding/seeding', () => ({
   Seeding: class Seeding {},
}));

import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { Seeding } from 'src/infrastructure/persistence/seeding/seeding';
import { createApp } from './app.factory';

describe('createApp', () => {
   it('creates app and runs seeding before returning it', async () => {
      const seed = jest.fn().mockResolvedValue(undefined);
      const app = {
         resolve: jest.fn().mockResolvedValue({ seed }),
      };
      (NestFactory.create as jest.Mock).mockResolvedValue(app);

      const result = await createApp();

      expect(NestFactory.create).toHaveBeenCalledWith(AppModule, {
         bufferLogs: true,
      });
      expect(app.resolve).toHaveBeenCalledWith(Seeding);
      expect(seed).toHaveBeenCalledTimes(1);
      expect(result).toBe(app);
   });
});
