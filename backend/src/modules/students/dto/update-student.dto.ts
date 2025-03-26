import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

export class UpdateStudentDto  {
    code: string;
    
    major_id?: string | number;
    
    department_id?: string | number;;
    
    @IsOptional()
    @ValidateNested({ message: 'Người dùng không hợp lệ' })
    @Type(() => Object) // Replace with a DTO for User if available
    user?: object;
}
