import {
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
  
  export class UpdateTeacherDto {
   
    code: string | any;
  
    @ValidateNested()
    @Type(() => UpdateUserDto)
    user: UpdateUserDto;
  
    degree: string;
  
    
    positionIds?: number[];
  
    
    departmentId: any;
  }
  