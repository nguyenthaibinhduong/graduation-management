import { memoryStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

interface CustomMulterOptions {
  allowedMimeTypes?: string[];
  maxSizeInMB?: number;
}

export function generateMulterOptions(options?: CustomMulterOptions): MulterOptions {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'],
    maxSizeInMB = 3,
  } = options || {};

  return {
    storage: memoryStorage(), // ✅ chỉ dùng memoryStorage
    limits: {
      fileSize: maxSizeInMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('File type not allowed!'), false);
      }
      cb(null, true);
    },
  };
}
