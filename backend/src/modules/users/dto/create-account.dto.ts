import {
    IsString,
    IsNotEmpty,
    IsIn,
  } from 'class-validator';
  
  export class CreateAccountDto {
    @IsString({ message: 'Tên đăng phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên đăng không được để trống' })
    username: string;
  
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
  
    @IsString({ message: 'Vai trò phải là chuỗi' })
    @IsNotEmpty({ message: 'Vai trò không được để trống' })
    @IsIn(['student','admin','teacher'], { message: 'Vai trò chỉ được là "user" hoặc "admin"' })
    role: string;
  }
  