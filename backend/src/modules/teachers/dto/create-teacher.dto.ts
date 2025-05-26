import {
  IsString,
  IsInt,
  IsOptional,
  IsDate,
  Length,
  IsNotEmpty,
  ValidateIf,
  Matches,
  IsArray,
  isNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class CreateTeacherDto {
  @IsNotEmpty({ message: 'Mã giảng viên không được để trống' })
  code: string | any;

  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  degree: string;

  @IsArray({ message: 'Vị trí không được để trống' })
  positionIds?: number[];

  @IsNotEmpty({ message: 'Khoa không được để trống' })
  departmentId: any;
}
