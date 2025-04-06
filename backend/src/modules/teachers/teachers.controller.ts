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

@Controller('teachers')
// @UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

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
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: Teacher[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const teachers = await this.teacherService.getAllTeachers(
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
  async findOne(@Param('id') id: number): Promise<Response<Teacher>> {
    try {
      const teacher = await this.teacherService.getById({ where: { id } });
      return teacher
        ? new Response(teacher, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) teacher: UpdateTeacherDto,
  ): Promise<Response<Teacher>> {
    try {
      const updatedTeacher = await this.teacherService.updateTeacher(
        id,
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
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.teacherService.delete(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Post('remove-multi')
  async removeMulti(
    @Body() ids: number[],
  ): Promise<Response<void> | HttpException> {
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
}
