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

  @IsString({ message: 'Mã sinh viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  code: string;

  @IsNotEmpty({ message: 'Tên sinh viên không được để trống' })
  major_id?: string | number;

  @IsNotEmpty({ message: 'Tên sinh viên không được để trống' })
  department_id?: string | number;;

  @IsOptional()
  @ValidateNested({ message: 'Người dùng không hợp lệ' })
  @Type(() => Object) // Replace with a DTO for User if available
  user?: object;
}
