import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateScoreDetailDto {
  @IsNotEmpty()
  @IsNumber()
  score_id: number;

  @IsOptional()
  @IsNumber()
  student_id?: number;

  @IsNotEmpty()
  @IsNumber()
  criteria_id: number;

  @IsNotEmpty()
  @IsNumber()
  teacher_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  scoreValue: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsEnum(['GVHD', 'GVPB', 'HD'], {
    message: 'teacherType must be one of: GVHD, GVPB, or HD',
  })
  teacherType?: 'GVHD' | 'GVPB' | 'HD';
}

export class UpdateScoreDetailDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  scoreValue?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(['GVHD', 'GVPB', 'HD'], {
    message: 'teacherType must be one of: GVHD, GVPB, or HD',
  })
  teacherType?: 'GVHD' | 'GVPB' | 'HD';
}

export class ScoreDetailResponseDto {
  id: number;
  score_id: number;
  student_id?: number;
  criteria_id: number;
  teacher_id: number;
  scoreValue: number;
  comment: string;
  teacherType?: 'GVHD' | 'GVPB' | 'HD';
  created_at: Date;
  updated_at: Date;
}
