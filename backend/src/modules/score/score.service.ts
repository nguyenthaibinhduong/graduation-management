import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource, QueryFailedError } from 'typeorm';
import { Score } from 'src/entities/score.entity';
import { ScoreDetail } from 'src/entities/score_detail.entity';
import { Project } from 'src/entities/project.entity';
import { CreateScoreDetailDto } from './dto/create_score_detail.dto';
import { Group } from 'src/entities/group.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { Student } from 'src/entities/student.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(ScoreDetail)
    private readonly scoreDetailRepository: Repository<ScoreDetail>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly dataSource: DataSource,
  ) {}

  //Student score
  async createStudentScoreByTeacher(
    groupId: number,
    createScoreDetailDto: CreateScoreDetailDto[],
    createScoreDto: CreateScoreDto,
  ): Promise<void> {
    // Start a transaction
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //find group by id
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
        relations: ['project'],
      });
      if (!group) {
        throw new NotFoundException('Nhóm không tồn tại');
      }
      // //find student id by group id
      const students = await queryRunner.manager.find(Student, {
        where: { group: { id: groupId } },
        relations: ['group'],
      });
      if (!students || students.length === 0) {
        throw new ConflictException('Không có sinh viên trong nhóm');
      }

      //Create the Score entity
      const score = new Score();
      score.group = group;
      score.comment = createScoreDto.comment;
      const savedScore = await queryRunner.manager.save(Score, score);

      // // Create ScoreDetail entities for each student
      for (const detail of createScoreDetailDto) {
        const scoreDetail = new ScoreDetail();
        scoreDetail.score = savedScore;
        const student = students.find((s) => s.id === detail.studentId);
        if (!student) {
          throw new Error('Sinh viên không tồn tại');
        }
        scoreDetail.student = student;
        scoreDetail.scoreValue = detail.scoreValue;
        scoreDetail.comment = detail.comment;

        await queryRunner.manager.save(ScoreDetail, scoreDetail);
      }

      // // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  //Group score
  async createGroupScoreByTeacher(
    groupId: number,
    createScoreDto: CreateScoreDto,
  ): Promise<void> {
    // Start a transaction
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //find project by id
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
        relations: ['project'],
      });
      if (!group) {
        throw new NotFoundException('Nhóm không tồn tại');
      }
      if (!group.project) {
        throw new NotFoundException('Nhóm không có dự án nào');
      }

      // Get project by group id
      // const project = await queryRunner.manager.findOne(Project, {
      //   where: { id: group.project.id },
      //   relations: ['groups'],
      // });
      //Create the Score entity
      // const score = new Score();
      // score.comment = createScoreDto.comment;
      // score.total_score = createScoreDto.total_score;
      // await queryRunner.manager.save(Score, score);
      // // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  // Get score
  async getAllScore(): Promise<ScoreDetail[]> {
    try {
      const scoreDetails = await this.scoreDetailRepository.find({
        relations: ['score'],
      });
      return scoreDetails;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách điểm');
    }
  }
  async getScoreByGroupId(groupId: number): Promise<ScoreDetail[]> {
    try {
      const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['project'],
      });
      if (!group) {
        throw new NotFoundException('Nhóm không tồn tại');
      }
      const scoreDetails = await this.scoreDetailRepository.find({
        where: { score: { group } },
        relations: ['score'],
      });
      return scoreDetails;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách điểm');
    }
  }

  async getScoreByStudentId(studentId: number): Promise<ScoreDetail[]> {
    try {
      const student = await this.groupRepository.findOne({
        where: { id: studentId },
        relations: ['project'],
      });
      if (!student) {
        throw new NotFoundException('Sinh viên không tồn tại');
      }

      const scoreDetails = await this.scoreDetailRepository.find({
        where: { student: { id: studentId } },
        relations: ['score'],
      });

      return scoreDetails;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách điểm');
    }
  }

  async getScoreByProjectId(projectId: number): Promise<ScoreDetail[]> {
    try {
      const project = await this.groupRepository.findOne({
        where: { id: projectId },
        relations: ['project'],
      });

      if (!project) {
        throw new NotFoundException('Dự án không tồn tại');
      }

      const scoreDetails = await this.scoreDetailRepository.find({
        where: { score: { project } },
        relations: ['score'],
      });

      return scoreDetails;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách điểm');
    }
  }

  //
}
