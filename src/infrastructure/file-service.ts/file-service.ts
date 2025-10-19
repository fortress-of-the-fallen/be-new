import { IFileService } from 'src/application/interface/file-service/i-file-service';
import { MinioConfig } from './minio.config';
import {
   DeleteObjectCommand,
   GetObjectCommand,
   HeadObjectCommand,
   PutObjectCommand,
} from '@aws-sdk/client-s3';
import { IdentityHelper } from 'src/domain/helper/identity.helper';
import { Inject, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class FileService implements IFileService {
   constructor(
      @Inject(MinioConfig)
      private readonly minioConfig: MinioConfig,
   ) {}

   async getFileStreamChunk(
      publicId: string,
      start: number,
      end: number,
   ): Promise<NodeJS.ReadableStream> {
      const res = await this.minioConfig.getClient().send(
         new GetObjectCommand({
            Bucket: this.minioConfig.getBucket(),
            Key: publicId,
            Range: `bytes=${start}-${end}`,
         }),
      );

      return res.Body as NodeJS.ReadableStream;
   }

   async uploadFile(
      fileBuffer: Buffer,
      filename: string,
      folder: string,
      metadata?: Record<string, string> | null,
   ): Promise<string> {
      const uuid = IdentityHelper.generateUUID();
      const key = folder ? `${folder}/${uuid}-${filename}` : `${uuid}-${filename}`;

      await this.minioConfig.getClient().send(
         new PutObjectCommand({
            Bucket: this.minioConfig.getBucket(),
            Key: key,
            Body: fileBuffer,
            ContentType: 'application/octet-stream',
            Metadata: {
               originalname: filename,
               uuid,
               ...(metadata ?? {}), // null metadata will not add any extra fields
            },
         }),
      );

      return key;
   }

   async deleteFile(key: string): Promise<void> {
      await this.minioConfig.getClient().send(
         new DeleteObjectCommand({
            Bucket: this.minioConfig.getBucket(),
            Key: key,
         }),
      );
   }

   async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
      const res = await this.minioConfig.getClient().send(
         new GetObjectCommand({
            Bucket: this.minioConfig.getBucket(),
            Key: key,
         }),
      );

      return res.Body as NodeJS.ReadableStream;
   }

   async getFileSize(key: string): Promise<number> {
      const res = await this.minioConfig.getClient().send(
         new HeadObjectCommand({
            Bucket: this.minioConfig.getBucket(),
            Key: key,
         }),
      );

      return res.ContentLength ?? 0;
   }
}
