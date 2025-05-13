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
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  CreateGroupScoreDto,
  CreateStudentScoreDto,
} from './dto/create-score.dto';
import { CreateScoreDetailDto } from './dto/score-detail.dto';

@Controller('score')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('scores/group')
  async createGroupScore(
    @Body() scoreDto: CreateGroupScoreDto,
  ): Promise<Response<void>> {
    try {
      await this.scoreService.createGroupScore(scoreDto);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Post('scores/student')
  async createIndividualScore(
    @Body() scoreDto: CreateStudentScoreDto,
  ): Promise<Response<void>> {
    try {
      await this.scoreService.createStudentScore(scoreDto);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
  //Determine teacher type
  @Get('teacher-type/:scoreId/:teacherId')
  async determineTeacherType(
    @Param('scoreId') groupId: number,
    @Param('teacherId') teacherId: number | string,
  ): Promise<Response<any>> {
    try {
      const teacherType = await this.scoreService.determineTeacherType(
        groupId,
        teacherId,
      );
      const response = {
        groupId,
        teacherId,
        teacherType,
        description: this.getTeacherTypeDescription(teacherType),
      };

      return new Response(response, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  private getTeacherTypeDescription(
    type: 'advisor' | 'reviewer' | 'committee' | null,
  ): string {
    switch (type) {
      case 'advisor':
        return 'Giáo viên hướng dẫn';
      case 'reviewer':
        return 'Giáo viên phản biện';
      case 'committee':
        return 'Thành viên hội đồng';
      default:
        return 'Không xác định vai trò';
    }
  }
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.scoreService.deleteScore(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get('student/:studentId/total-score')
  async getStudentTotalScore(
    @Param('studentId') studentId: string | number,
  ): Promise<Response<any>> {
    try {
      const totalScore = await this.scoreService.calculateTotalScore(studentId);
      return new Response(
        { studentId, totalScore },
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
}
