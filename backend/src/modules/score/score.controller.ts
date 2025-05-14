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
  Query,
  ParseIntPipe,
  NotFoundException,
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
import { DecodedId } from 'src/common/decorators/decode-id.decorators';
import { ScoreDetail } from 'src/entities/score_detail.entity';
import { Group } from 'src/entities/group.entity';

@Controller('score')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('group')
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

  @Post('student')
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

  @Post('detail')
  async createScoreDetail(
    @Body() scoreDetailDto: CreateScoreDetailDto,
  ): Promise<Response<void>> {
    try {
      await this.scoreService.createScoreDetail(scoreDetailDto);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

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
  @Delete('detail/:id')
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

  @Get('student/weighted-total-score/:studentId')
  async getWeightedTotalScore(
    @DecodedId(['params', 'studentId']) studentId: number,
  ): Promise<Response<any>> {
    try {
      const scoreData = await this.scoreService.calculateWeightedTotalScore(
        Number(studentId),
      );

      if (!scoreData) {
        return new Response(
          { studentId, weighted: null, byType: {} },
          HttpStatus.SUCCESS,
          'No scores found for this student',
        );
      }

      return new Response(
        {
          studentId: scoreData.studentId,
          weightedTotal: scoreData.weightedTotal,
          byType: scoreData.byType,
          appliedWeights: scoreData.appliedWeights,
          missingEvaluations: scoreData.missingEvaluations,
          isComplete: scoreData.isComplete,
        },
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

  @Put('detail/:id')
  async updateScoreDetail(
    @Param() scoreDetailId: number,
    @Body() updateData: Partial<ScoreDetail>,
  ): Promise<Response<ScoreDetail>> {
    try {
      const updatedScoreDetail = await this.scoreService.updateScoreDetail(
        scoreDetailId,
        updateData,
      );
      return new Response(
        updatedScoreDetail,
        HttpStatus.SUCCESS,
        'Score detail updated successfully',
      );
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  /**
   * Get all groups for a teacher, optionally filtered by teacher type
   */
  @Get('teacher-groups/:teacherId')
  async getGroupsByTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Query('type') teacherType?: 'advisor' | 'reviewer' | 'committee',
  ): Promise<
    Response<{ advisor?: Group[]; reviewer?: Group[]; committee?: Group[] }>
  > {
    try {
      const groups = await this.scoreService.getGroupsByTeacherRole(
        teacherId,
        teacherType,
      );

      // Check if any groups were found
      const hasGroups = Object.values(groups).some(
        (groupArray) => groupArray && groupArray.length > 0,
      );

      return new Response(
        groups,
        HttpStatus.SUCCESS,
        hasGroups ? Message.SUCCESS : 'No groups found for this teacher',
      );
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  /**
   * Get all score details for a student grouped by teacher type
   */
  @Get('student/details/:studentId')
  async getStudentScoreDetails(
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<Response<any>> {
    try {
      const scoreDetails =
        await this.scoreService.getScoreDetailByStudentId(studentId);

      return new Response(scoreDetails, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new Response({ studentId }, HttpStatus.SUCCESS, error.message);
      }

      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
