import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScoreDto {
  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  total_score: number;
}
