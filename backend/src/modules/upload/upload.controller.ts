import { BadRequestException, Body, Controller, Delete, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload/:type')
  @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
  async uploadFile(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

      let uploadOptions: { folder: string; types: string[]; maxSize: number } | null = null;

      if (type === 'avatar') {
        uploadOptions = {
          folder: 'QLKL/user-avatar',
          types: ['image/jpeg', 'image/png'],
          maxSize: 10
        };
      } else if (type === 'file') {
        uploadOptions = {
          folder: 'QLKL/user-files',
          types: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          maxSize: 20
        };
      } else {
        throw new BadRequestException('Invalid file type');
      }

      if (uploadOptions) {
        const result = await this.uploadService.uploadFile(
          file,
          uploadOptions.folder,
          uploadOptions.types,
          uploadOptions.maxSize
        );
        return {
          url: result.secure_url,
        };
    } else {
      throw new BadRequestException('Invalid upload options');
    }
    
  }
   @Post('delete')
  async deleteFile(@Body('url') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('Thiếu URL');
    }

    const result = await this.uploadService.deleteFileByUrl(fileUrl);
    return {
      message: 'Xóa file thành công',
      result,
    };
  }
}
