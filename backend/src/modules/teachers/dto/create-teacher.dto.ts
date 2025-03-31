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

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  user: any;

  @IsNotEmpty()
  degree: string;
}
