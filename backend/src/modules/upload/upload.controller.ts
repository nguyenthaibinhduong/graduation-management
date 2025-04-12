import { BadRequestException, Body, Controller, Delete, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.uploadService.uploadFile(file,'QLKL',['image/jpeg','image/png',],10);
    return {
      url: result.secure_url
    };
    
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
