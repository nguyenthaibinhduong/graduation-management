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
import { EnrollmentSessionsService } from './enrollment_session.service';
import { CreateEnrollmentSessionDto } from './dto/create-enrollment_session.dto';
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';
import { Response } from 'src/common/globalClass';

@Controller('enrollment_sessions')
// @UseGuards(JwtAuthGuard)
export class EnrollmentSessionsController {
  constructor(private readonly enrollmentSessionService: EnrollmentSessionsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) enrollmentSession: CreateEnrollmentSessionDto,
  ): Promise<Response<EnrollmentSession>> {
    try {
      const newEnrollmentSession = await this.enrollmentSessionService.createEnrollmentSession(enrollmentSession);
      return new Response(newEnrollmentSession, HttpStatus.SUCCESS, Message.SUCCESS);
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
    Response<{ items: EnrollmentSession[]; total: number; limit?: number; page?: number }>
  > {
    try {
      const enrollmentSessions = await this.enrollmentSessionService.getAllEnrollmentSession(search, limit, page);
      return new Response(enrollmentSessions, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<EnrollmentSession>> {
    try {
      const enrollmentSession = await this.enrollmentSessionService.getById({ where: { id } });
      return enrollmentSession
        ? new Response(enrollmentSession, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) enrollmentSession: CreateEnrollmentSessionDto,
  ): Promise<Response<EnrollmentSession>> {
    try {
      const updatedEnrollmentSession = await this.enrollmentSessionService.updateEnrollmentSession(
        id,
        enrollmentSession,
      );
      return updatedEnrollmentSession
        ? new Response(updatedEnrollmentSession, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.enrollmentSessionService.delete(id);
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
      await this.enrollmentSessionService.delete(ids);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
