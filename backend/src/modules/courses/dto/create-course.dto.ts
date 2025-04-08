import { IsString, IsDateString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;
}
