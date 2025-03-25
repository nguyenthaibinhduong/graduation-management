import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
  @IsString({ message: 'Tên chức vụ phải là chuỗi' })
  name: string;
}
