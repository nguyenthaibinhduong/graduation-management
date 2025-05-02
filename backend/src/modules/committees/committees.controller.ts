import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { Committee } from 'src/entities/committee.entity';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { Response } from 'src/common/globalClass';

@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{
      items: Committee[];
      total: number;
      limit?: number;
      page?: number;
    }>
  > {
    try {
      const students = await this.committeesService.getAllCommittees(
        search,
        limit,
        page,
      );
      return new Response(students, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body(new ValidationPipe()) createCommitteeDto: CreateCommitteeDto,
  ): Promise<Response<Committee>> {
    try {
      // Await the result of the service method
      const newCommittee =
        await this.committeesService.createCommittee(createCommitteeDto);
      return new Response(newCommittee, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
