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
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { w } from '@faker-js/faker/dist/airline-D6ksJFwG';
import { User, UserRole } from 'src/entities/user.entity';

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
    private readonly jwtUtilityService: JwtUtilityService,
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
        throw new NotFoundException('Nhóm không hợp lệ');
      }

      // Use manager to find project
      const projectEntity = await queryRunner.manager.findOne(Project, {
        where: { id: project_id },
      });
      if (!projectEntity) {
        throw new NotFoundException('Đề tài không hợp lệ');
      }

      // Use manager to check for existing score
      const existingScore = await queryRunner.manager.findOne(Score, {
        where: { group: { id: group_id } },
      });
      if (existingScore) {
        throw new ConflictException('Đã có điểm');
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

      throw new InternalServerErrorException('Lỗi khi chấm điểm');
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
        throw new NotFoundException('Sinh viên không hợp lệ');
      }

      // Use manager to find project
      const projectEntity = await queryRunner.manager.findOne(Project, {
        where: { id: project_id },
      });
      if (!projectEntity) {
        throw new NotFoundException('Đề tài không hợp lệ');
      }

      // Use manager to check for existing score
      const existingScore = await queryRunner.manager.findOne(Score, {
        where: { student: { id: student_id } },
      });
      if (existingScore) {
        throw new ConflictException('Sinh viên đã có điểm');
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

      throw new InternalServerErrorException('Lỗi');
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
        throw new NotFoundException('Điểm không hợp lệ');
      }

      await queryRunner.manager.delete(Score, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Lỗi');
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

    try {
      const score = await this.check_exist_with_data(
        Score,
        { where: { id: score_id } },
        null,
      );
      const teacher = await this.check_exist_with_data(
        Teacher,
        { where: { id: teacher_id } },
        'Giảng viên không hợp lệ',
      );
      const student = await this.check_exist_with_data(
        Student,
        { where: { id: student_id }, relations: ['group'] },
        'Sinh viên không hợp lệ',
      );
      const criteria = await this.check_exist_with_data(
        Criteria,
        { where: { id: criteria_id } },
        'Tiêu chí không hợp lệ',
      );
      const teacherRole = await this.determineTeacherType(
        student.group.id,
        teacher_id,
        teacherType,
      );
      if (!teacherRole) {
        throw new NotFoundException(`Giáo viên không có quyền chấm`);
      }

      // Check for existing score detail to avoid duplicates
      const existingDetail = await this.repository.manager.findOne(
        ScoreDetail,
        {
          where: {
            teacher: { id: teacher_id },
            student: { id: student_id },
            criteria: { id: criteria_id },
            teacherType: teacherType,
          },
        },
      );

      if (existingDetail) {
        throw new ConflictException('Bạn đã chấm điểm cho sinh viên này');
      }
      const scoreDetailEntity = new ScoreDetail();
      Object.assign(scoreDetailEntity, {
        ...data,
        score,
        teacher,
        student,
        criteria,
        teacherType: teacherRole,
      });
      await this.repository.manager.save(scoreDetailEntity);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi');
    }
  }

  async determineTeacherType(
    groupId: number,
    teacherId: number | string,
    typeCheck: string,
  ): Promise<'advisor' | 'reviewer' | 'committee' | null> {
    const group = await this.repository.manager.findOne(Group, {
      where: { id: groupId },
      relations: ['project', 'teacher', 'facultyReviewers', 'committee'],
    });

    if (!group || !group.project)
      throw new NotFoundException(
        !group
          ? 'Thông tin nhóm hoặc giáo viên không chính xác'
          : 'Nhóm chưa có đề tài',
      );

    if (typeCheck === 'advisor' && group.teacher?.id == teacherId)
      return 'advisor';

    if (
      typeCheck === 'reviewer' &&
      group.facultyReviewers?.some((r) => r.id == teacherId)
    )
      return 'reviewer';

    if (typeCheck === 'committee' && group.committee?.id) {
      const committee = await this.repository.manager.findOne(Committee, {
        where: { id: group.committee.id },
        relations: ['teachers'],
      });
      if (committee?.teachers.some((t) => t.id == teacherId))
        return 'committee';
    }

    return null;
  }

  /**
   * Calculate scores by teacher type (advisor, reviewer, committee)
   * @param studentId The student ID to calculate scores for
   * @returns Object with scores broken down by teacher type
   */
  async calculateScoresByTeacherType(studentId: number): Promise<any> {
    try {
      // Get all score details for the student
      const scoreDetails = await this.scoreDetailRepository.find({
        where: { student: { id: studentId } },
        relations: ['criteria', 'teacher'],
      });

      if (!scoreDetails || scoreDetails.length === 0) {
        return null;
      }

      // Group scores by teacher type
      const groupedScores = {
        advisor: { totalWeightedScore: 0, totalWeight: 0, count: 0 },
        reviewer: { totalWeightedScore: 0, totalWeight: 0, count: 0 },
        committee: { totalWeightedScore: 0, totalWeight: 0, count: 0 },
      };

      // Process each score detail
      scoreDetails.forEach((detail) => {
        const type = detail.teacherType || 'unknown';
        const weight = detail.criteria.weightPercent || 0;
        const score = detail.scoreValue;
        // Skip if invalid teacher type
        if (!groupedScores[type] && type !== 'unknown') {
          return;
        }

        if (groupedScores[type]) {
          groupedScores[type].totalWeightedScore += weight * score;
          groupedScores[type].totalWeight = 100;
          groupedScores[type].count++;
        }
      });

      // Calculate final scores
      const result = {};
      Object.entries(groupedScores).forEach(([type, data]) => {
        if (data.totalWeight > 0 && data.count > 0) {
          result[type] = {
            score: Number(
              (data.totalWeightedScore / data.totalWeight).toFixed(2),
            ),
            count: data.count,
          };
        } else {
          result[type] = { score: null, count: 0 };
        }
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error calculating scores by teacher type',
      );
    }
  }

  /**
   * Calculate scores by teacher type with specified weights
   * (advisor: 40%, reviewer: 30%, committee: 30%)
   * @param studentId The student ID to calculate scores for
   * @returns Object with scores broken down by teacher type and weighted total
   */
  async calculateWeightedTotalScore(studentId: number): Promise<any> {
    try {
      // Get scores by teacher type first
      const scoresByType = await this.calculateScoresByTeacherType(studentId);

      if (!scoresByType) {
        return null;
      }

      // Define weights for each teacher type
      const typeWeights = {
        advisor: 0.4, // 40%
        reviewer: 0.3, // 30%
        committee: 0.3, // 30%
      };

      // Calculate weighted final score
      let weightedTotal = 0;
      let appliedWeightTotal = 0;
      let missingTypes = [];

      // Check which scores we have and calculate weighted score
      Object.entries(typeWeights).forEach(([type, weight]) => {
        if (scoresByType[type]?.score !== null) {
          weightedTotal += scoresByType[type].score * weight;
          appliedWeightTotal += weight;
        } else {
          missingTypes.push(type);
        }
      });

      // Calculate final weighted score
      let finalScore = null;
      if (appliedWeightTotal > 0) {
        // Normalize the score if we're missing some teacher types
        if (appliedWeightTotal < 1) {
          finalScore = Number((weightedTotal / appliedWeightTotal).toFixed(2));
        } else {
          finalScore = Number(weightedTotal.toFixed(2));
        }
      }

      return {
        studentId: this.jwtUtilityService.encodeId(studentId),
        byType: scoresByType,
        weightedTotal: finalScore,
        appliedWeights: {
          advisor:
            scoresByType.advisor?.score !== null ? typeWeights.advisor : 0,
          reviewer:
            scoresByType.reviewer?.score !== null ? typeWeights.reviewer : 0,
          committee:
            scoresByType.committee?.score !== null ? typeWeights.committee : 0,
        },
        missingEvaluations: missingTypes,
        isComplete: missingTypes.length === 0,
      };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi');
    }
  }

  async updateScoreDetail(
    id: number,
    updateData: Partial<ScoreDetail>,
    typeCheck: any,
    userId: any,
  ): Promise<ScoreDetail> {
    const user = await this.check_exist_with_data(
      User,
      {
        where: { id: userId, role: UserRole.TEACHER },
        relations: ['teacher'],
      },
      'Tài khoản không hợp lệ',
    );
    const scoreDetail = await this.check_exist_with_data(
      ScoreDetail,
      {
        where: { id },
        relations: {
          student: {
            group: true,
          },
        },
      },
      'Lỗi',
    );
    if (scoreDetail.isLocked) {
      throw new NotFoundException(
        'Vui lòng liên hệ admin nếu muốn chỉnh sửa điểm',
      );
    }
    const teacherRole = await this.determineTeacherType(
      scoreDetail?.student?.group?.id,
      user?.teacher?.id,
      typeCheck,
    );

    if (!teacherRole) {
      throw new NotFoundException(`Giáo viên không có quyền sửa điểm`);
    }

    Object.assign(scoreDetail, updateData);

    scoreDetail.isLocked = true;
    const updatedScoreDetail = await this.repository.manager.save(scoreDetail);

    return updatedScoreDetail;
  }

  /**
   * Get all groups where the specified teacher has specific roles
   * @param teacherId The teacher ID to find groups for
   * @param teacherType Optional filter by specific teacher type (advisor, reviewer, committee)
   * @returns Array of groups with added teacherRole property
   */
  async getGroupsByTeacherRole(
    teacherId: number,
    teacherType?: 'advisor' | 'reviewer' | 'committee',
  ): Promise<Group[]> {
    try {
      let allGroups: Group[] = [];

      // Advisor
      if (!teacherType || teacherType === 'advisor') {
        const advisorGroups = await this.groupRepository.find({
          where: { teacher: { id: teacherId } },
          relations: [
            'project',
            'students',
            'students.user',
            'leader',
            'leader.user',
            'department',
            'teacher',
            'teacher.user',
            'committee',
          ],
        });

        advisorGroups.forEach((group) => {
          (group as any).teacherRole = 'advisor';
        });

        allGroups = [...allGroups, ...advisorGroups];

        if (teacherType === 'advisor') return allGroups;
      }

      // Reviewer
      if (!teacherType || teacherType === 'reviewer') {
        const reviewerGroups = await this.groupRepository
          .createQueryBuilder('group')
          .innerJoinAndSelect(
            'group.facultyReviewers',
            'reviewer',
            'reviewer.id = :teacherId',
            { teacherId },
          )
          .leftJoinAndSelect('group.project', 'project')
          .leftJoinAndSelect('group.students', 'students')
          .leftJoinAndSelect('students.user', 'studentUser')
          .leftJoinAndSelect('group.leader', 'leader')
          .leftJoinAndSelect('leader.user', 'leaderUser')
          .leftJoinAndSelect('group.department', 'department')
          .leftJoinAndSelect('group.teacher', 'teacher')
          .leftJoinAndSelect('teacher.user', 'teacherUser')
          .leftJoinAndSelect('group.committee', 'committee')
          .getMany();

        reviewerGroups.forEach((group) => {
          (group as any).teacherRole = 'reviewer';
        });

        allGroups = [...allGroups, ...reviewerGroups];

        if (teacherType === 'reviewer') return allGroups;
      }

      // Committee
      if (!teacherType || teacherType === 'committee') {
        // Get all groups where the group's committee contains this teacher
        const committeeGroups = await this.groupRepository
          .createQueryBuilder('group')
          .innerJoinAndSelect('group.committee', 'committee')
          .innerJoin(
            'committee.teachers',
            'committeeTeacher',
            'committeeTeacher.id = :teacherId',
            { teacherId },
          )
          .leftJoinAndSelect('group.project', 'project')
          .leftJoinAndSelect('group.students', 'students')
          .leftJoinAndSelect('students.user', 'studentUser')
          .leftJoinAndSelect('group.leader', 'leader')
          .leftJoinAndSelect('leader.user', 'leaderUser')
          .leftJoinAndSelect('group.department', 'department')
          .leftJoinAndSelect('group.teacher', 'teacher')
          .leftJoinAndSelect('teacher.user', 'teacherUser')
          .getMany();

        committeeGroups.forEach((group) => {
          (group as any).teacherRole = 'committee';
        });

        allGroups = [...allGroups, ...committeeGroups];

        if (teacherType === 'committee') return allGroups;
      }

      return allGroups;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error retrieving groups for teacher',
      );
    }
  }

  async getScoreDetailByStudentId(
    studentId: number,
    teacherType?: 'advisor' | 'reviewer' | 'committee',
  ): Promise<any> {
    try {
      // Get overall scores by teacher type
      const scoresByType = await this.calculateScoresByTeacherType(studentId);
      const weightedScoreResult =
        await this.calculateWeightedTotalScore(studentId);
      // Get score details
      const scoreDetails = await this.scoreDetailRepository.find({
        where: { student: { id: studentId } },
        relations: ['criteria', 'teacher', 'teacher.user'],
        select: {
          id: true,
          scoreValue: true,
          teacherType: true,
          comment: true,
          isLocked: true,
          criteria: {
            name: true,
            content: true,
            max_score: true,
            weightPercent: true,
            step: true,
          },
          teacher: {
            id: true,
            code: true,
            user: {
              fullname: true,
            },
          },
        },
      });

      // If no score details, return all properties as null and missingEvaluations is all 3 types
      if (!scoreDetails || scoreDetails.length === 0) {
        return {
          advisor: null,
          reviewer: null,
          committee: null,
          advisor_overall: null,
          reviewer_overall: null,
          committee_overall: null,
          weightedTotal: null,
          appliedWeights: null,
          isComplete: null,
          missingEvaluations: ['advisor', 'reviewer', 'committee'],
        };
      }

      // Group score details by teacherType
      const groupedScoreDetails = scoreDetails.reduce(
        (acc, detail) => {
          const type = detail.teacherType || 'unknown';
          if (!acc[type]) {
            acc[type] = [];
          }
          const { teacherType, ...detailWithoutType } = detail;
          acc[type].push(detailWithoutType);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      const result = { ...groupedScoreDetails };

      // Add overall score for each teacher type at the beginning of the array
      if (scoresByType) {
        Object.keys(result).forEach((type) => {
          if (scoresByType[type]?.score !== null) {
            result[`${type}_overall`] = scoresByType[type].score;
          }
        });
      }

      // Compose the final result

      // Compose isLocked per teacherType
      const isLocked: Record<string, boolean> = {
        advisor:
          (groupedScoreDetails.advisor || []).some((d) => d.isLocked) || false,
        reviewer:
          (groupedScoreDetails.reviewer || []).some((d) => d.isLocked) || false,
        committee:
          (groupedScoreDetails.committee || []).some((d) => d.isLocked) ||
          false,
      };

      const fullResult = {
        ...result,
        weightedTotal: weightedScoreResult?.weightedTotal ?? null,
        appliedWeights: weightedScoreResult?.appliedWeights ?? null,
        isComplete: weightedScoreResult?.isComplete ?? null,
        isLocked,
        missingEvaluations: weightedScoreResult?.missingEvaluations ?? [
          'advisor',
          'reviewer',
          'committee',
        ],
      };
      if (teacherType) {
        const filtered: any = {
          weightedTotal: fullResult.weightedTotal,
          appliedWeights: fullResult.appliedWeights,
          isComplete: fullResult.isComplete,
          missingEvaluations: fullResult.missingEvaluations,
          isLocked: fullResult.isLocked[teacherType],
        };
        filtered[teacherType] = fullResult[teacherType] ?? null;
        filtered[`${teacherType}_overall`] =
          fullResult[`${teacherType}_overall`] ?? null;
        return filtered;
      }

      // Otherwise, return all
      return fullResult;
    } catch (error) {
      // Always return nulls if any error occurs
      return {
        advisor: null,
        reviewer: null,
        committee: null,
        advisor_overall: null,
        reviewer_overall: null,
        committee_overall: null,
        weightedTotal: null,
        appliedWeights: null,
        isComplete: null,
        missingEvaluations: ['advisor', 'reviewer', 'committee'],
      };
    }
  }

  // Get scores for group
  async getGroupScore(groupId: any): Promise<any> {
    const group = await this.check_exist_with_data(
      Group,
      {
        where: { id: groupId },
        relations: ['students', 'project'],
      },
      'Nhóm không hợp lệ',
    );

    const members = group.students;
    if (!members || members.length === 0) {
      throw new NotFoundException('Không có sinh viên trong nhóm');
    }
    // const existingGroupScore = await this.check_exist_with_data(Score,{
    //   where: { group: { id: groupId } },
    // },'Nhóm đã có điểm');
    for (const member of members) {
      const existingStudentScore = await this.scoreRepository.findOne({
        where: { student: { id: member.id } },
      });
      if (existingStudentScore) {
        throw new ConflictException(`Sinh viên mã ${member.id} đã có điểm`);
      }
    }
    var groupScore = 0;
    for (const member of members) {
      const score = await this.calculateWeightedTotalScore(member.id);
      if (!score || score.isComplete == false) {
        return { ...group, groupScore: null, isComplete: false };
      }
      groupScore += score.weightedTotal;
    }
    groupScore = groupScore / members.length;
    return { ...group, groupScore, isComplete: true };
  }

  //Admin unclok score detail
  async unlockScoreDetail(id: number): Promise<void> {
    const scoreDetail = await this.scoreDetailRepository.findOne({
      where: { id },
    });
    if (!scoreDetail) throw new NotFoundException('Điểm không hợp lệ');
    scoreDetail.isLocked = false;
    await this.scoreDetailRepository.save(scoreDetail);
  }
}
