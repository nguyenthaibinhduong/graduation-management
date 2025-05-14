import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommitteeDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên hội đồng không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsNotEmpty({ message: 'Tổng số giáo viên không được để trống' })
  total_teacher: number;

  @IsInt()
  @IsNotEmpty({ message: 'Tổng số dự án không được để trống' })
  total_project: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  time_start: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  time_end: Date;

  @IsEnum(['inactive', 'active'], { message: 'Trạng thái không hợp lệ' })
  @IsOptional()
  status?: 'inactive' | 'active';

  @IsOptional()
  course_id?: number;

  @IsOptional()
  department_id?: number;

  @IsOptional()
  evaluation_id?: number;

  @IsOptional()
  @Type(() => Number)
  project_ids?: number[];

  @IsOptional()
  @Type(() => Number)
  teacher_ids?: number[];
}
