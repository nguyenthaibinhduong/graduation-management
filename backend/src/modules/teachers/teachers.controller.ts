import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ValidationPipe,
  UseGuards,
  HttpException,
} from '@nestjs/common';

import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher } from 'src/entities/teacher.entity';
import { Response } from 'src/common/globalClass';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(
    private readonly teacherService: TeachersService,
    private readonly jwtUtilityService: JwtUtilityService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) teacher: CreateTeacherDto,
  ): Promise<Response<Teacher>> {
    try {
      const newTeacher = await this.teacherService.createTeacher(teacher);
      return new Response(newTeacher, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('departmentId') department_id?: string,
    @Query('positionIds') position_ids?: number[],
    @Query('orderBy') orderBy: string = 'DESC',
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: Teacher[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const teachers = await this.teacherService.getAllTeachers(
        department_id,
        position_ids,
        orderBy,
        search,
        limit,
        page,
      );
      return new Response(teachers, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@DecodedId('params')  id: number): Promise<Response<Teacher>> {
    try {
     
      const teacher = await this.teacherService.getById({
        where: { id },
      });
      return teacher
        ? new Response(teacher, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) teacher: UpdateTeacherDto,
  ): Promise<Response<Teacher>> {
    try {
      const decodedId = this.jwtUtilityService.decodeId(id);
      const updatedTeacher = await this.teacherService.updateTeacher(
        decodedId,
        teacher,
      );
      return updatedTeacher
        ? new Response(updatedTeacher, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@DecodedId('params') id: number): Promise<Response<void>> {
    try {
      // const decodedId = this.jwtUtilityService.decodeId(id);
      await this.teacherService.delete(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

 @Post('remove-multi')
async removeMulti(
  @DecodedId('body') ids: number[],
): Promise<Response<void>> {
  try {
    await this.teacherService.delete(ids);
    return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
  } catch (error) {
    throw new HttpException(
      { statusCode: HttpStatus.ERROR, message: error.message },
      HttpStatus.ERROR,
    );
  }
}


  @Post('import')
  async importStudents(
    @Body() teachers: [],
  ): Promise<Response<void> | HttpException> {
    try {
      // Thực hiện việc thêm nhiều sinh viên vào cơ sở dữ liệu
      const result = await this.teacherService.createManyTeacher(teachers);
      const data = {
        message: `Đã thêm ${result.success} giảng viên.`,
        errors: result.errors,
      };
      // Trả về phản hồi thành công
      return new Response<any>(
        data,
        HttpStatus.SUCCESS,
        'Thêm giảng viên thành công',
      );
    } catch (error) {
      // Xử lý lỗi khi có sự cố
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
