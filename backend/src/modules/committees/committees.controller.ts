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
  Put,
} from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { Committee } from 'src/entities/committee.entity';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { Response } from 'src/common/globalClass';
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('committees')
export class CommitteesController {
  constructor(
    private readonly committeesService: CommitteesService,
    private readonly jwtUtilityService: JwtUtilityService,
  ) {}

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

  @Get(':id')
  async findOne(@DecodedId(["params"]) id: string): Promise<Response<any>> {
    try {
      const decodeId = this.jwtUtilityService.decodeId(id);
      const committee = await this.committeesService.getCommitteeById(decodeId);
      return new Response(committee, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @DecodedId(["params"]) id: string,
    @Body(new ValidationPipe()) updateCommitteeDto: UpdateCommitteeDto,
  ): Promise<Response<Committee>> {
    try {
      const decodeId = this.jwtUtilityService.decodeId(id);
      const updatedGroup = await this.committeesService.updateCommittee(
        decodeId,
        updateCommitteeDto,
      );
      return new Response(updatedGroup, HttpStatus.SUCCESS, Message.SUCCESS);
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

  @Delete(':id')
  async remove(@DecodedId(["params"]) id: string): Promise<Response<void>> {
    try {
      const decodeId = this.jwtUtilityService.decodeId(id);
      const deletedCommittee =
        await this.committeesService.deleteCommittee(decodeId);
      return new Response(
        deletedCommittee,
        HttpStatus.SUCCESS,
        Message.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
  @Post('remove-multi')
  async removeMulti(
    @Body() ids: string[],
  ): Promise<Response<void> | HttpException> {
    try {
      const idArray = Array.isArray(ids) ? ids : [ids];
      const decodedIds = idArray.map((id) => {
        return this.jwtUtilityService.decodeId(id);
      });
      await this.committeesService.deleteCommittee(decodedIds);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
