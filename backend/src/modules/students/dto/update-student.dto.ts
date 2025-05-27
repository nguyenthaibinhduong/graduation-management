
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { UpdateUserDto } from "src/modules/users/dto/update-user.dto";

export class UpdateStudentDto  {
    @IsString({ message: 'Mã sinh viên phải là chuỗi' })
     code: string;
   
    
     major_id?: string | number;
   
     department_id?: string | number;;
   
     @ValidateNested()
     @Type(() => UpdateUserDto)
     user: UpdateUserDto;
}
