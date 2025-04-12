import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v2 , UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

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
    mimetypeAccept = '', 
    sizeAccept = 5
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Chưa có tệp tin nào được chọn');

    // Kiểm tra MIME type (theo các kiểu mặc định và kiểu người dùng yêu cầu)
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tệp tin không được hỗ trợ');
    }

    if (mimetypeAccept && !file.mimetype.includes(mimetypeAccept)) {
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
}
