import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  Query,
  HttpException,
  Put,
} from '@nestjs/common';
import { EvaluationFormService } from './evaluation_form.service';
import { CreateEvaluationFormDto } from './dto/create-evaluation_form.dto';
import { UpdateEvaluationFormDto } from './dto/update-evaluation_form.dto';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';

@Controller('departments')
export class EvaluationFormController {
  constructor(private readonly departmentService: EvaluationFormService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) department: CreateEvaluationFormDto,
  ): Promise<Response<EvaluationForm>> {
    try {
      const newEvaluationForm = await this.departmentService.create(department);
      return new Response(newEvaluationForm, HttpStatus.SUCCESS, Message.SUCCESS);
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
    Response<{
      items: EvaluationForm[];
      total: number;
      limit?: number;
      page?: number;
    }>
  > {
    try {
      const departments = await this.departmentService.getAll(
        search,
        limit,
        page,
      );
      return new Response(departments, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<EvaluationForm>> {
    try {
      const department = await this.departmentService.getById({
        where: { id },
      });
      return department
        ? new Response(department, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) department: UpdateEvaluationFormDto,
  ): Promise<Response<EvaluationForm>> {
    try {
      const updatedEvaluationForm = await this.departmentService.update(
        id,
        { where: { id } },
        department,
      );
      return updatedEvaluationForm
        ? new Response(updatedEvaluationForm, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.departmentService.delete(id);
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
      await this.departmentService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
