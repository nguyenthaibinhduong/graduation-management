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
import { Group } from 'src/entities/group.entity';
import {
  CreateGroupScoreDto,
  CreateStudentScoreDto,
} from './dto/create-score.dto';
import { Student } from 'src/entities/student.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Teacher } from 'src/entities/teacher.entity';
import { Criteria } from 'src/entities/criteria.entity';
import { BaseService } from 'src/common/base.service';
import { Committee } from 'src/entities/committee.entity';
import { CreateScoreDetailDto } from './dto/score-detail.dto';
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';

@Injectable()
export class ScoreService extends BaseService<Score> {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(ScoreDetail)
    private readonly scoreDetailRepository: Repository<ScoreDetail>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly dataSource: DataSource,
  ) {
    super(scoreRepository);
  }

  // Create Group Score directly
  async createGroupScore(scoreDto: CreateGroupScoreDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { group_id, project_id, ...scoreData } = scoreDto;

      // Use manager instead of repository
      const groupEntity = await queryRunner.manager.findOne(Group, {
        where: { id: group_id },
      });
      if (!groupEntity) {
        throw new NotFoundException('Group not found');
      }

      // Use manager to find project
      const projectEntity = await queryRunner.manager.findOne(Project, {
        where: { id: project_id },
      });
      if (!projectEntity) {
        throw new NotFoundException('Project not found');
      }

      // Use manager to check for existing score
      const existingScore = await queryRunner.manager.findOne(Score, {
        where: { group: { id: group_id } },
      });
      if (existingScore) {
        throw new ConflictException('Score for this group already exists');
      }

      // Create score entity
      const newScore = new Score();
      Object.assign(newScore, {
        ...scoreData,
        group: groupEntity,
        project: projectEntity,
      });

      // Save using manager
      const savedScore = await queryRunner.manager.save(newScore);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating score');
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  // Create Student Score directly
  async createStudentScore(scoreDto: CreateStudentScoreDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { student_id, project_id, ...scoreData } = scoreDto;

      // Use manager to find student
      const studentEntity = await queryRunner.manager.findOne(Student, {
        where: { id: student_id },
      });
      if (!studentEntity) {
        throw new NotFoundException('Student not found');
      }

      // Use manager to find project
      const projectEntity = await queryRunner.manager.findOne(Project, {
        where: { id: project_id },
      });
      if (!projectEntity) {
        throw new NotFoundException('Project not found');
      }

      // Use manager to check for existing score
      const existingScore = await queryRunner.manager.findOne(Score, {
        where: { student: { id: student_id } },
      });
      if (existingScore) {
        throw new ConflictException('Score for this student already exists');
      }

      // Create score entity
      const newScore = new Score();
      Object.assign(newScore, {
        ...scoreData,
        student: studentEntity,
        project: projectEntity,
      });

      // Save using manager
      const savedScore = await queryRunner.manager.save(newScore);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating student score');
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  // Delete score
  async deleteScore(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const score = await queryRunner.manager.findOne(Score, {
        where: { id },
      });
      if (!score) {
        throw new NotFoundException('Score not found');
      }

      await queryRunner.manager.delete(Score, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error deleting score');
    } finally {
      await queryRunner.release();
    }
  }

  // Create Score Detail
  async createScoreDetail(scoreDetail: CreateScoreDetailDto): Promise<void> {
    const {
      score_id,
      teacher_id,
      student_id,
      criteria_id,
      teacherType,
      ...data
    } = scoreDetail;
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      // validate score_id
      const score = await queryRunner.manager.findOne(Score, {
        where: { id: score_id },
      });
      if (!score) {
        throw new NotFoundException('Score not found');
      }
      // validate teacher_id
      const teacher = await queryRunner.manager.findOne(Teacher, {
        where: { id: teacher_id },
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
      // validate student_id
      const student = await queryRunner.manager.findOne(Student, {
        where: { id: student_id },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      // validate criteria_id
      const criteria = await queryRunner.manager.findOne(Criteria, {
        where: { id: criteria_id },
      });
      if (!criteria) {
        throw new NotFoundException('Criteria not found');
      }

      // create score detail
      const scoreDetailEntity = new ScoreDetail();
      Object.assign(scoreDetailEntity, {
        ...data,
        score: score,
        teacher: teacher,
        student: student,
        criteria: criteria,
        teacherType: this.determineTeacherType(score_id, teacher_id),
      });
      // save score detail
      await queryRunner.manager.save(scoreDetailEntity);
      // commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Score detail already exists');
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating score detail');
    }
  }

  /**
   * Determines the teacher's role type for a given group
   * @param groupId - The ID of the group
   * @param teacherId - The ID of the teacher
   * @returns The type of teacher ('advisor', 'reviewer', 'committee') or null if not found
   */
  async determineTeacherType(
    groupId: number,
    teacherId: number | string,
  ): Promise<'advisor' | 'reviewer' | 'committee' | null> {
    const group = await this.repository.manager.findOne(Group, {
      where: { id: groupId },
      relations: ['project', 'teacher', 'facultyReviewers'],
    });

    if (!group) {
      throw new NotFoundException(
        `Thông tin nhóm hoặc giáo viên không chính xác`,
      );
    }

    if (!group.project) {
      throw new NotFoundException(
        `Không tìm thấy thông tin dự án cho nhóm này`,
      );
    }
    console.log('group', group);
    if (group.teacher.id == teacherId) {
      return 'advisor';
    }
    if (group.facultyReviewers) {
      const isReviewer = group.facultyReviewers.some(
        (reviewer) => reviewer.id == teacherId,
      );
      if (isReviewer) {
        return 'reviewer';
      }
    }

    const committeeCount = await this.dataSource
      .createQueryBuilder()
      .select('committee.id')
      .from(Committee, 'committee')
      .innerJoin('committee.teachers', 'teacher', 'teacher.id = :teacherId', {
        teacherId,
      })
      .innerJoin('committee.projects', 'project', 'project.id = :projectId', {
        projectId: group.project.id,
      })
      .getCount();

    if (committeeCount > 0) {
      return 'committee';
    }

    return null;
  }

  /**
   * Calculate weighted total score for a student using formula:
   * totalScore = sum(weight * scoreValue) / 100
   *
   * @param studentId - The ID of the student
   * @returns The weighted total score or null if no scores exist
   */
  async calculateTotalScore(studentId: any): Promise<number | null> {
    // Find score details with their related criteria
    const scoreDetails = await this.scoreDetailRepository.find({
      where: { student: { id: studentId } },
      relations: ['criteria'],
    });

    if (!scoreDetails || scoreDetails.length === 0) {
      return null;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    scoreDetails.forEach((scoreDetail) => {
      const weight = scoreDetail.criteria.weightPercent || 0;

      totalWeightedScore += weight * scoreDetail.scoreValue;

      totalWeight += weight;
    });

    const finalScore = totalWeightedScore / totalWeight;
    return Number(finalScore.toFixed(2));
  }

  /**
   * Find enrollment session ID from project by student ID
   *
   * @param studentId - The ID of the student
   * @returns The enrollment session ID or null if not found
   */
  async findEnrollmentSessionIdByStudentId(
    studentId: number,
  ): Promise<number | null> {
    try {
      // First find the student with their group
      const student = await this.repository.manager.findOne(Student, {
        where: { id: studentId },
        relations: ['group'],
      });

      if (!student || !student.group) {
        return null; // Student not found or not assigned to any group
      }

      // Find the group with its project
      const group = await this.repository.manager.findOne(Group, {
        where: { id: student.group.id },
        relations: ['project'],
      });

      if (!group || !group.project) {
        return null; // Group not found or no project assigned
      }

      // Find the project with its session
      const project = await this.repository.manager.findOne(Project, {
        where: { id: group.project.id },
        relations: ['session'],
      });

      if (!project || !project.session) {
        return null; // Project not found or no session assigned
      }

      return project.session.id;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding enrollment session by student ID',
      );
    }
  }
}
