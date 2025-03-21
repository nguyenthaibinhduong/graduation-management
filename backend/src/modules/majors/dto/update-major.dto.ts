import { PartialType } from '@nestjs/mapped-types';
import { CreateMajorDto } from './create-major.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMajorDto extends PartialType(CreateMajorDto) {
  @IsOptional()
  @IsString()
  name?: string;
}
