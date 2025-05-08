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
  UseGuards,
} from '@nestjs/common';
import { EvaluationFormService } from './evaluation_form.service';
import { CreateEvaluationFormDto } from './dto/create-evaluation_form.dto';
import { UpdateEvaluationFormDto } from './dto/update-evaluation_form.dto';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('evaluation-forms')
  @UseGuards(JwtAuthGuard)
export class EvaluationFormController {
  constructor(private readonly EvaluationFormService: EvaluationFormService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) data: CreateEvaluationFormDto,
  ): Promise<Response<void>> {
    try {
      const newEvaluationForm = await this.EvaluationFormService.createEvaluation(data);
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
      const form = await this.EvaluationFormService.getAll(
        search,
        limit,
        page,
      );
      return new Response(form, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@DecodedId(["params"]) id: number): Promise<Response<EvaluationForm>> {
    try {
      const form = await this.EvaluationFormService.getDatailEvaluation(id);
      return form
        ? new Response(form, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @DecodedId(["params"]) id: number,
    @Body(new ValidationPipe()) form: UpdateEvaluationFormDto,
  ): Promise<Response<EvaluationForm>> {
    try {
      const updatedEvaluationForm = await this.EvaluationFormService.update(
        id,
        { where: { id } },
        form,
      );
      return updatedEvaluationForm
        ? new Response(updatedEvaluationForm, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@DecodedId(["params"]) id: number): Promise<Response<void>> {
    try {
      await this.EvaluationFormService.delete(id);
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
      await this.EvaluationFormService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
