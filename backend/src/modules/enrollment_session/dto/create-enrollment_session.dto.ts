import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsNumber,
  MinDate,
} from 'class-validator';

export class CreateEnrollmentSessionDto {
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Thời gian bắt đầu không đúng định dạng' })
  // @MinDate(new Date(), { message: 'Thời gian bắt đầu phải sau thời điểm hiện tại' })
  start_time: Date;

  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsDateString({}, { message: 'Thời gian kết thúc không đúng định dạng' })
  end_time: Date;

  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content: string;

  @IsNotEmpty({ message: 'Phòng ban không được để trống' })
  department_id: number | string;

  @IsNotEmpty({ message: 'Khóa học không được để trống' })
  // @IsNumber({}, { message: 'Khóa học phải là số' })
  course_id: number | string;
}
