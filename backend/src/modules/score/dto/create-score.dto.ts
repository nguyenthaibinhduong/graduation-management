import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupScoreDto {
  @IsNotEmpty()
  group_id: any;

  @IsNotEmpty()
  project_id: any;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  totalScore?: number;
}

export class CreateStudentScoreDto {
  @IsNotEmpty()
  student_id: any;

  @IsNotEmpty()
  project_id: any;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  totalScore?: number;
}
