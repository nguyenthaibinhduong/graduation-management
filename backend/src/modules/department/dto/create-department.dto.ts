import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({ message: 'Tên khoa không được để trống' })
  @IsString({ message: 'Tên khoa phải là chuỗi' })
  name: string;
}
