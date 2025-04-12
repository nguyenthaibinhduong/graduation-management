import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 , UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof v2, // Sử dụng đúng kiểu được inject
  ) {}

  // Danh sách các MIME type hỗ trợ
  private allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Hàm upload file
    async uploadFile(
    file: Express.Multer.File, 
    folder = 'QLKL',
    mimetypeAccept = [], 
    sizeAccept = 5
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Chưa có tệp tin nào được chọn');

    // Kiểm tra MIME type (theo các kiểu mặc định và kiểu người dùng yêu cầu)
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tệp tin không được hỗ trợ');
    }

    if (mimetypeAccept && !mimetypeAccept.includes(file.mimetype)) {
      throw new BadRequestException('Tệp tin không được hỗ trợ');
    }

    // Kiểm tra kích thước file
    const maxSize = sizeAccept * 1024 * 1024; // Tính kích thước tối đa (theo MB)
    if (file.size > maxSize) {
      throw new BadRequestException(`Tệp tin có kích thước quá ${sizeAccept}MB`);
    }

    // Cấu hình upload
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'auto', // Tự động xác định kiểu tài nguyên (image, video, raw, pdf, v.v.)
      transformation: [
            { fetch_format: 'auto' }, // ✅ đúng chỗ để dùng 'auto'
        ], // Tự động chuyển đổi định dạng (webp, jpeg, pdf, v.v.)
    };

    // Sử dụng Promise để xử lý upload và trả về kết quả
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            // Nếu có lỗi trong quá trình upload, reject với lỗi
            return reject(new BadRequestException('Upload failed: ' + error.message));
          }
          // Nếu upload thành công, resolve kết quả
          resolve(result);
        },
      );

      // Tạo stream từ buffer và upload lên Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
    }
    
    async deleteFileByUrl(fileUrl: string): Promise<any> {
        if (!fileUrl) {
        throw new BadRequestException('URL không hợp lệ');
        }

        const { publicId, resourceType } = this.extractPublicId(fileUrl);

        try {
            const result = await this.cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType, // image, video, raw
            });
            return result;
        } catch (error) {
        throw new BadRequestException('Không thể xóa tệp: ' + error.message);
        }
    }

   private extractPublicId(fileUrl: string): { publicId: string; resourceType: 'image' | 'video' | 'raw' } {
    try {
        const url = new URL(fileUrl);
        const pathname = url.pathname; // /<cloud_name>/<resource_type>/upload/v<version>/<folder?>/filename.ext

        const parts = pathname.split('/'); // ['', 'cloud_name', 'resource_type', 'upload', 'v12345678', ...folder?, filename.ext]
        const fileWithExt = parts.pop(); // filename.ext
        const fileName = fileWithExt.split('.')[0]; // filename without extension

        // Lấy resource_type ('image', 'video', 'raw') từ vị trí parts[2]
        const resourceType = parts[2] as 'image' | 'video' | 'raw';

        // Lấy phần public_id = folder?/fileName
        const folderParts = parts.slice(5); // sau 'v<version>'
        const publicId = folderParts.length > 0 ? `${folderParts.join('/')}/${fileName}` : fileName;

        return {
        publicId,
        resourceType,
        };
    } catch (error) {
        throw new Error('URL không hợp lệ hoặc không thể tách public_id');
    }
    }


}
