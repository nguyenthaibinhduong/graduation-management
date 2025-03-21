import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @IsOptional()
  @IsString({ message: 'Tên chức vụ phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  majorId?: number;
}
