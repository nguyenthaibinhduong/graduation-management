import { Controller, Get, Post, Body,  Param, Delete, ValidationPipe, Query, HttpException, Put } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { Major } from 'src/entities/major.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';

@Controller('majors')
export class MajorsController {
  constructor(private readonly majorService: MajorsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) major: CreateMajorDto,
  ): Promise<Response<Major>> {
    try {
      const newMajor = await this.majorService.create(major);
      return new Response(newMajor, HttpStatus.SUCCESS, Message.SUCCESS);
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
    Response<{ items: Major[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const majors = await this.majorService.getAll(search, limit, page);
      return new Response(majors, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<Major>> {
    try {
      const major = await this.majorService.getById({ where: { id } });
      return major
        ? new Response(major, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) major: CreateMajorDto,
  ): Promise<Response<Major>> {
    try {
      const updatedMajor = await this.majorService.update(
        id,
        { where: { id } },
        major,
      );
      return updatedMajor
        ? new Response(updatedMajor, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.majorService.delete(id);
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
      await this.majorService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
