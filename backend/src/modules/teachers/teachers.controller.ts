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
    @Body(new ValidationPipe()) body: CreateTeacherDto,
    @DecodedId(['body', 'departmentId']) departmentId?: string,
    @DecodedId(['body', 'positionIds']) positionIds?: number[],
  ): Promise<Response<Teacher>> {
    try {
      const teacher = {
        ...body,
        departmentId,
        positionIds,
      };
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
    @DecodedId(['query', 'departmentId']) department_id?: string,
    @DecodedId(['query', 'positionIds']) position_ids?: number[],
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
  async findOne(@DecodedId(['params']) id: number): Promise<Response<Teacher>> {
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
    @DecodedId(['params']) id: string,
    @Body(new ValidationPipe()) teacher: UpdateTeacherDto,
    @DecodedId(["body", "positionIds"]) positionIds: any,
    @DecodedId(["body","departmentId"]) departmentId: any,
  ): Promise<Response<Teacher>> {
    try {
      const data = {
        ...teacher,
        positionIds,
        departmentId,
      }
      const updatedTeacher = await this.teacherService.updateTeacher(id,data);
      return updatedTeacher
        ? new Response(updatedTeacher, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@DecodedId(['params']) id: number): Promise<Response<void>> {
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
    @DecodedId(['body', 'ids']) ids: number[],
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
  async importTeachers(
    @Body() teachers: CreateTeacherDto[],
  ): Promise<Response<void> | HttpException> {
    try {
      // Decode department_id and position_ids for each teacher
      const decodedTeachers = teachers.map((teacher) => ({
        ...teacher,
        departmentId: this.jwtUtilityService.decodeId(teacher.departmentId),
        positionIds: teacher.positionIds?.map((id) =>
          this.jwtUtilityService.decodeId(id),
        ),
      }));

      // Call the service to create multiple teachers
      const result =
        await this.teacherService.createManyTeacher(decodedTeachers);

      const data = {
        message: `Đã thêm ${result.success} giảng viên.`,
        errors: result.errors,
      };

      // Return a success response
      return new Response<any>(
        data,
        HttpStatus.SUCCESS,
        'Thêm giảng viên thành công',
      );
    } catch (error) {
      // Handle errors
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
