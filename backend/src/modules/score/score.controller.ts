import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { CreateScoreDetailDto } from './dto/create_score_detail.dto';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('score')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('student-score')
  async createStudentScore(
    @Body()
    body: {
      groupId: number;
      scoreDetail: CreateScoreDetailDto[];
      score: CreateScoreDto;
    },
  ): Promise<Response<any>> {
    try {
      const { groupId, scoreDetail, score } = body;
      const newScore = await this.scoreService.createStudentScoreByTeacher(
        groupId,
        scoreDetail,
        score,
      );
      return new Response(newScore, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('group-score')
  async createGroupScore(
    @Body()
    body: {
      groupId: number;
      score: CreateScoreDto;
    },
  ): Promise<Response<any>> {
    try {
      const { groupId, score } = body;
      const newScore = await this.scoreService.createGroupScoreByTeacher(
        groupId,
        score,
      );
      return new Response(newScore, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get()
  async findAll(): Promise<Response<any>> {
    try {
      const scores = await this.scoreService.getAllScore();
      return new Response(scores, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
