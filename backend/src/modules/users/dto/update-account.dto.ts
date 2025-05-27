import {
    IsString,
    IsNotEmpty,
    IsIn,
  } from 'class-validator';
  
  export class UpdateAccountDto {
    @IsString({ message: 'Tên đăng phải là chuỗi' })
    username: string;
  
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    password: string;
  
    @IsString({ message: 'Vai trò phải là chuỗi' })
    @IsIn(['student','admin','teacher'], { message: 'Vai trò không hợp lệ' })
    role: string;
  }
  