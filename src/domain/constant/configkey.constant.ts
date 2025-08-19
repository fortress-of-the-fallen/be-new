import { NodeEnv } from '../enum/node_env';
import { config } from '../helper/setting.helper';

class ConfigKeyConstant {
   static readonly NodeEnv: NodeEnv = (() => {
      const env = config.node.env as NodeEnv;
      const validValues = Object.values(NodeEnv);

      if (!validValues.includes(env)) {
         throw new Error(
            `Invalid NODE_ENV: "${config.node.env}". Must be one of ${validValues.join(', ')}`,
         );
      }

      return env;
   })();
   static readonly SwaggerDescriptionPath: string = 'assets/html/swagger-description.md';
   static readonly ServerPort: number = Number(config.server.port) || 3000;
   static readonly AppAdminPassword: string = config.app.adminPassword || 'admin123';
   static readonly AppMasterPassword: string = config.app.masterPassword || 'admin123';

   static readonly HmacSecret: string =
      config.security.hmacSecret ||
      'ca5ab5284b959921c8ec80e1ba4a75517351895aeff211a1440ef082e804589d';

   static readonly DateBase = {
      ConnectionUrl: String(config.mongo.connectionUrl),
      BaseDbName: String(config.mongo.baseDbName) || 'BaseDatabase',
      UniversalDbName: String(config.mongo.universalDbName) || 'UniversalDatabase',
      BackgoundHanlderDbName: String(config.mongo.agendaDbName) || 'AgendaDatabase',
   };

   static readonly Redis = {
      Host: config.redis.host || 'localhost',
      Port: Number(config.redis.port) || 6379,
      Password: config.redis.password || '',
      ConnectTimeout: Number(config.redis.connectTimeout) || 1000,
   };
   
   static readonly Minio = {
      Bucket: config.minio.bucket || 'Bucket',
      Url: config.minio.url || 'http://localhost:9000',
      User: config.minio.user || 'appuser',
      UserPassword: config.minio.userPassword || 'appsecret',
   };

   static readonly Smtp = {
      Host: config.smtp.host || 'smtp.example.com',
      Port: Number(config.smtp.port) || 587,
      User: config.smtp.user || '...',
      Password: config.smtp.pass || '...',
      Secure: config.smtp.secure === 'true',
   };
}

export { ConfigKeyConstant };
