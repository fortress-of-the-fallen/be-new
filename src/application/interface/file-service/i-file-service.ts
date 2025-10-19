export interface IFileService {
   uploadFile(fileBuffer: Buffer, filename: string, folder: string): Promise<string>;

   uploadFile(
      fileBuffer: Buffer,
      filename: string,
      folder: string,
      metadata?: Record<string, string> | null,
   ): Promise<string>;

   deleteFile(publicId: string): Promise<void>;

   getFileStreamChunk(publicId: string, start: number, end: number): Promise<NodeJS.ReadableStream>;

   getFileSize(publicId: string): Promise<number>;

   getFileStreamChunk(publicId: string, start: number, end: number): Promise<NodeJS.ReadableStream>;
}

export const IFileService = Symbol('IFileService');
