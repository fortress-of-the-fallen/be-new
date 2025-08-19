import { S3Client } from '@aws-sdk/client-s3';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';

@Injectable({ scope: Scope.DEFAULT })
export class MinioConfig {
   private readonly client: S3Client;
   private readonly BUCKET = ConfigKeyConstant.Minio.Bucket;

   constructor() {
      this.client = new S3Client({
         region: 'us-east-1',
         endpoint: ConfigKeyConstant.Minio.Url,
         forcePathStyle: true,
         credentials: {
            accessKeyId: ConfigKeyConstant.Minio.User,
            secretAccessKey: ConfigKeyConstant.Minio.UserPassword,
         },
      });
   }

   getClient(): S3Client {
      return this.client;
   }

   getBucket(): string {
      return this.BUCKET as string;
   }
}
