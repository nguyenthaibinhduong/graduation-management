
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
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { Course } from "src/entities/course.entity";
import { Response } from 'src/common/globalClass';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('courses')
// @UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) course: CreateCourseDto,
  ): Promise<Response<Course>> {
    try {
      const newCourse = await this.courseService.create(course);
      return new Response(newCourse, HttpStatus.SUCCESS, Message.SUCCESS);
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
    Response<{ items: Course[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const courses = await this.courseService.getAll(search, limit, page);
      return new Response(courses, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@DecodedId(["params"]) id: number): Promise<Response<Course>> {
    try {
      const course = await this.courseService.getById({ where: { id } });
      return course
        ? new Response(course, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @DecodedId(["params"]) id: number,
    @Body(new ValidationPipe()) course: CreateCourseDto,
  ): Promise<Response<Course>> {
    try {
      const updatedCourse = await this.courseService.update(
        id,
        { where: { id } },
        course,
      );
      return updatedCourse
        ? new Response(updatedCourse, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@DecodedId(["params"]) id: number): Promise<Response<void>> {
    try {
      await this.courseService.delete(id);
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
      await this.courseService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
