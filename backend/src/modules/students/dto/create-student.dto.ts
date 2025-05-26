import {
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { User } from 'src/entities/user.entity';

export class CreateStudentDto {

  

  @IsString({ message: 'Mã sinh viên phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
  code: string;

  @IsNotEmpty({ message: 'Chuyên ngành không được để trống' })
  major_id?: string | number;

  @IsNotEmpty({ message: 'Khoa không được để trống' })
  department_id?: string | number;;

  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
