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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from '../../entities/student.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) student: CreateStudentDto ,
  ): Promise<Response<Student>> {
    try {
      const newStudent = await this.studentService.createStudent(student);
      return new Response(newStudent, HttpStatus.SUCCESS, Message.SUCCESS);
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
    Response<{ items: Student[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const students = await this.studentService.getAllStudent(search, limit, page);
      return new Response(students, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<Student>> {
    try {
      const student = await this.studentService.getById({ where: { id } });
      return student
        ? new Response(student, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
     throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string ,
    @Body(new ValidationPipe()) student: UpdateStudentDto,
  ): Promise<Response<Student>> {
    try {
      const updatedStudent = await this.studentService.updateStudent(id,student);
      return updatedStudent
        ? new Response(updatedStudent, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.studentService.delete(id);
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
      await this.studentService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
