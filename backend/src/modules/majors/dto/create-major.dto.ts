import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMajorDto {
  @IsNotEmpty({ message: 'Tên chuyên ngành không được để trống' })
  @IsString({ message: 'Tên chuyên ngành phải là chuỗi' })
  name: string;
}
