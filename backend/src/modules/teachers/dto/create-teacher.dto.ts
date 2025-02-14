export class CreateTeacherDto {}
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
  @IsString({ message: 'Tên giảng viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên giảng viên không được để trống' })
  @Length(1, 100, {
    message: 'Tên giảng viên phải có độ dài từ 1 đến 100 ký tự',
  })
  name: string;

  @IsString({ message: 'Mã giảng viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã giảng viên không được để trống' })
  teacher_code: string;

  @IsOptional()
  @IsDate({ message: 'Ngày sinh phải là kiểu dữ liệu ngày tháng' })
  @Type(() => Date)
  date_of_birth?: Date;

  @IsOptional()
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  major?: string;
}
