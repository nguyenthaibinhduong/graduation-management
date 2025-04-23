import { IsNotEmpty } from 'class-validator';

export class CreateScoreDetailDto {
  @IsNotEmpty()
  scoreValue: number;

  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  scoreId: number;

  @IsNotEmpty()
  studentId: any;
}
