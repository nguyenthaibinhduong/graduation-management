
import {
    IsString,
    IsNotEmpty,
    IsDateString,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    IsEmail,
  } from 'class-validator';
  
  // Custom validator kiểm tra > 18 tuổi
  @ValidatorConstraint({ name: 'IsAdult', async: false })
  export class IsAdultConstraint implements ValidatorConstraintInterface {
    validate(date: string) {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
  
      return (
        age > 18 ||
        (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
      );
    }
  
    defaultMessage(args: ValidationArguments) {
      return 'Người dùng phải từ 18 tuổi trở lên';
    }
  }
  
  export class UpdateUserDto {
    @IsString({ message: 'Họ tên phải là chuỗi' })
    fullname: string;
  
    @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng ISO (YYYY-MM-DD)' })
    @Validate(IsAdultConstraint)
    birth_date: string;
    

    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
  }
  