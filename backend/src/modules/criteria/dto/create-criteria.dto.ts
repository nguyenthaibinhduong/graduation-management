import {
    IsNotEmpty,
    IsString,
    IsNumber,
    Min,
    Max,
    IsDecimal,
  } from 'class-validator';
import { Double } from 'typeorm';
  
  export class CreateCriteriaDto {
    @IsNotEmpty({ message: 'Tên tiêu chí không được để trống' })
    @IsString({ message: 'Tên tiêu chí phải là chuỗi' })
    name: string;
  
    
    content: string;
  
    @IsNotEmpty({ message: 'Điểm tối đa không được để trống' })
    
    max_score: number;
  
    @IsNotEmpty({ message: 'Bước điểm không được để trống' })
    step: number;
  
    @IsNotEmpty({ message: 'Tỉ trọng không được để trống' })
    @IsNumber({}, { message: 'Tỉ trọng phải là số' })
    @Min(0, { message: 'Tỉ trọng phải lớn hơn hoặc bằng 0%' })
    @Max(100, { message: 'Tỉ trọng không được vượt quá 100%' })
    weightPercent: number;
  }
  