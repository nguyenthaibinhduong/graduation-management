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
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { Position } from 'src/entities/position.entity';
import { Response } from 'src/common/globalClass';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('positions')
// @UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionService: PositionsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) position: CreatePositionDto,
  ): Promise<Response<Position>> {
    try {
      const newPosition = await this.positionService.create(position);
      return new Response(newPosition, HttpStatus.SUCCESS, Message.SUCCESS);
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
      items: Position[];
      total: number;
      limit?: number;
      page?: number;
    }>
  > {
    try {
      const positions = await this.positionService.getAll(search, limit, page);
      return new Response(positions, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @DecodedId(['params']) id: number,
  ): Promise<Response<Position>> {
    try {
      const position = await this.positionService.getById({ where: { id } });
      return position
        ? new Response(position, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @DecodedId(['params']) id: number,
    @Body(new ValidationPipe()) position: CreatePositionDto,
  ): Promise<Response<Position>> {
    try {
      const updatedPosition = await this.positionService.update(
        id,
        { where: { id } },
        position,
      );
      return updatedPosition
        ? new Response(updatedPosition, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@DecodedId(['params']) id: number): Promise<Response<void>> {
    try {
      await this.positionService.delete(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Post('remove-multi')
  async removeMulti(
    @DecodedId(['body', 'ids']) ids: number[],
  ): Promise<Response<void> | HttpException> {
    try {
      await this.positionService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
