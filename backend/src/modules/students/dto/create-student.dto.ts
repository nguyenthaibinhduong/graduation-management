import {
  IsString,
  IsInt,
  IsOptional,
  IsDate,
  Length,
  IsNotEmpty,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsString({ message: 'Tên sinh viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sinh viên không được để trống' })
  @Length(1, 100, {
    message: 'Tên sinh viên phải có độ dài từ 1 đến 100 ký tự',
  })
  name: string;

  @IsString({ message: 'Mã sinh viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  student_code: string;

  @IsOptional()
  @IsDate({ message: 'Ngày sinh phải là kiểu dữ liệu ngày tháng' })
  @Type(() => Date)
  date_of_birth?: Date;

  @IsOptional()
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  major?: string;

  @IsNotEmpty({ message: 'Năm học không được để trống' })
  enrollment_year?: number;
}
