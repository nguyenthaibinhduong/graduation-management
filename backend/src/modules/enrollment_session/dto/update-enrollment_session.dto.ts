import {

    IsString,
    IsDateString,
   
  } from 'class-validator';
  
  export class UpdateEnrollmentSessionDto {

    @IsDateString({}, { message: 'Thời gian bắt đầu phải đúng định dạng ISO (YYYY-MM-DD)' })
    start_time?: string;
  

    @IsDateString({}, { message: 'Thời gian kết thúc phải đúng định dạng ISO (YYYY-MM-DD)' })
    end_time?: string;
  

    @IsString({ message: 'Tiêu đề phải là chuỗi' })
    title?: string;
  

    @IsString({ message: 'Nội dung phải là chuỗi' })
    content?: string;
  
   
    department_id?: number;
  

    course_id?: number;
  }
  