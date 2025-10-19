import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { BaseMessage } from 'src/domain/message/base.message';
import * as UAParser from 'ua-parser-js';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { Request, Response } from 'express';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';
import { HashHelper } from 'src/domain/helper/hash.helper';
import { ExecutionRes } from '../model/res/base/execution-res.model';
import { NodeEnv } from 'src/domain/enum/node_env';

@Injectable()
export class HeaderCheckMiddleware implements NestMiddleware {
   constructor(
      @Inject(ILogger) private readonly logger: ILogger,
      @Inject(ICacheManager) private readonly cacheManager: ICacheManager,
   ) {
      this.logger.setContext('HeaderCheckMiddleware');
   }

   private readonly isDevMode: boolean = ConfigKeyConstant.NodeEnv === NodeEnv.Development;

   async use(req: Request, res: Response, next: (error?: Error | any) => void) {
      const response: ExecutionRes = new ExecutionRes();
      response.success = false;

      const [isValid, message] = await this.isValidHeader(req);
      if (!isValid) {
         response.error = message;
         response.errorCode = message;
         return res.status(400).json(response);
      }

      next();
   }

   private async isValidHeader(req: Request): Promise<[boolean, string]> {
      this.logger.debug(JSON.stringify(req.headers, null, 2));

      const userAgent = req.headers['user-agent'] || req.headers['User-Agent'];
      if (!userAgent) {
         return [false, BaseMessage.MISSING_USER_AGENT];
      }

      const [isUAValid, uaMessage] = await this.isValidUserAgent(userAgent as string);
      if (!isUAValid) {
         return [false, uaMessage];
      }

      return [true, ''];
   }

   private async isValidUserAgent(userAgent: string): Promise<[boolean, string]> {
      const parser = new UAParser.UAParser();
      const result = parser.setUA(userAgent).getResult();

      if (await this.cacheManager.has(HashHelper.hashString(userAgent))) {
         this.logger.debug(`User-Agent is cached: ${HashHelper.hashString(userAgent)}`);
         await this.cacheManager.set<boolean>(HashHelper.hashString(userAgent), true, 15);
         return [true, ''];
      }

      const validBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
      const validEngines = ['Blink', 'WebKit', 'Gecko'];
      const validOS = ['Windows', 'Mac OS', 'Linux'];

      const browserName = result.browser?.name;
      const browserVersion = parseInt(result.browser?.major || '0', 10);
      const engineName = result.engine?.name || '';
      const osName = result.os?.name || '';

      const isBrowserValid = browserName && validBrowsers.includes(browserName);
      const isEngineValid = validEngines.includes(engineName);
      const isVersionValid = browserVersion >= 50 && browserVersion <= 150;
      const isDesktopOS = validOS.includes(osName);

      const isUAEmpty =
         !result.browser?.name &&
         !result.cpu?.architecture &&
         !result.engine?.name &&
         !result.os?.name;

      if (
         (!isBrowserValid || !isEngineValid || !isVersionValid || !isDesktopOS || isUAEmpty) &&
         !this.isDevMode
      ) {
         return [false, BaseMessage.INVALID_HEADER];
      }

      await this.cacheManager.set<boolean>(HashHelper.hashString(userAgent), true, 25);
      return [true, ''];
   }
}
