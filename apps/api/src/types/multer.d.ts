declare module 'multer' {
  import { Request } from 'express';
  
  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  
  export interface StorageEngine {
    _handleFile(req: Request, file: File, callback: (error?: Error, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, callback: (error: Error) => void): void;
  }
  
  export function diskStorage(options: {
    destination?: string | ((req: Request, file: File, cb: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: File, cb: (error: Error | null, filename: string) => void) => void;
  }): StorageEngine;
  
  export interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      headerPairs?: number;
    };
    fileFilter?: (req: Request, file: File, cb: (error: Error | null, acceptFile: boolean) => void) => void;
  }
}

