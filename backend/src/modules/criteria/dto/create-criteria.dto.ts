import {
    IsNotEmpty,
    IsString,
    IsNumber,
    Min,
    Max,
  } from 'class-validator';
  
  export class CreateCriteriaDto {
    @IsNotEmpty({ message: 'Tên tiêu chí không được để trống' })
    @IsString({ message: 'Tên tiêu chí phải là chuỗi' })
    name: string;
  
    @IsNotEmpty({ message: 'Nội dung tiêu chí không được để trống' })
    @IsString({ message: 'Nội dung tiêu chí phải là chuỗi' })
    content: string;
  
    @IsNotEmpty({ message: 'Điểm tối đa không được để trống' })
    @IsNumber({}, { message: 'Điểm tối đa phải là số' })
    @Min(0, { message: 'Điểm tối đa phải lớn hơn hoặc bằng 0' })
    max_score: number;
  
    @IsNotEmpty({ message: 'Bước điểm không được để trống' })
    @IsNumber({}, { message: 'Bước điểm phải là số' })
    @Min(0.1, { message: 'Bước điểm phải lớn hơn 0' })
    step: number;
  
    @IsNotEmpty({ message: 'Tỉ trọng không được để trống' })
    @IsNumber({}, { message: 'Tỉ trọng phải là số' })
    @Min(0, { message: 'Tỉ trọng phải lớn hơn hoặc bằng 0%' })
    @Max(100, { message: 'Tỉ trọng không được vượt quá 100%' })
    weightPercent: number;
  }
  