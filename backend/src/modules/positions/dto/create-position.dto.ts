import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
  @IsString({ message: 'Tên chức vụ phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Khoa không được để trống' })
  @IsInt()
  departmentId: number;

  @IsNotEmpty({ message: 'Chuyên ngành không được để trống' })
  @IsInt()
  majorId: number;
}
