import {
  IsString,
  IsInt,
  IsOptional,
  IsDate,
  Length,
  IsNotEmpty,
  ValidateNested,
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
  code: string;

  @IsOptional()
  @IsDate({ message: 'Ngày sinh phải là kiểu dữ liệu ngày tháng' })
  @Type(() => Date)
  date_of_birth?: Date;

  @IsOptional()
  @ValidateNested({ message: 'Chuyên ngành không hợp lệ' })
  @Type(() => Object) // Replace with a DTO for Major if available
  major?: object;

  @IsOptional()
  @ValidateNested({ message: 'Khoa không hợp lệ' })
  @Type(() => Object) // Replace with a DTO for Department if available
  department?: object;

  @IsOptional()
  @ValidateNested({ message: 'Người dùng không hợp lệ' })
  @Type(() => Object) // Replace with a DTO for User if available
  user?: object;
}
