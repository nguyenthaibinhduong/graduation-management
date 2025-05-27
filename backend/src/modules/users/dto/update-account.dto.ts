import {
    IsString,
    IsNotEmpty,
    IsIn,
    IsDateString,
    Validate,
    IsEmail,
  } from 'class-validator';
  
  export class UpdateAccountDto {
    @IsString({ message: 'Tên đăng phải là chuỗi' })
    username?: string;
  
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    password?: string;
  
    @IsString({ message: 'Vai trò phải là chuỗi' })
    @IsIn(['student','admin','teacher'], { message: 'Vai trò không hợp lệ' })
      role?: string;
      
       @IsString({ message: 'Họ tên phải là chuỗi' })
          fullname?: string;
        
        @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng ISO (YYYY-MM-DD)' })
        birth_date?: string;
          
      
        @IsEmail({}, { message: 'Email không hợp lệ' })
        email?: string;

  }
  