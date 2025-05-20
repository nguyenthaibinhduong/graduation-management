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

    try {
      // validate score_id
      const score = await this.repository.manager.findOne(Score, {
        where: { id: score_id },
      });
      // if (!score) {
      //   throw new NotFoundException('Score not found');
      // }

      // validate teacher_id
      const teacher = await this.repository.manager.findOne(Teacher, {
        where: { id: teacher_id },
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      // validate student_id and get student with group relation
      const student = await this.repository.manager.findOne(Student, {
        where: { id: student_id },
        relations: ['group'],
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      // validate criteria_id
      const criteria = await this.repository.manager.findOne(Criteria, {
        where: { id: criteria_id },
      });
      if (!criteria) {
        throw new NotFoundException('Criteria not found');
      }

      // Get group id from student and determine teacher type
      let teacherRole = teacherType;

      if (student.group && !teacherRole) {
        teacherRole = await this.determineTeacherType(
          student.group.id,
          teacher_id,
        );
      }

      if (!teacherRole) {
        throw new NotFoundException(
          `Teacher with ID is not an advisor, reviewer, or committee member for this group`,
        );
      }

      // Check for existing score detail to avoid duplicates
      // const existingDetail = await this.repository.manager.findOne(
      //   ScoreDetail,
      //   {
      //     where: {
      //       teacher: { id: teacher_id },
      //       student: { id: student_id },
      //       criteria: { id: criteria_id },
      //     },
      //   },
      // );

      // if (existingDetail) {
      //   throw new ConflictException('Score detail already exists');
      // }

      // create score detail
      const scoreDetailEntity = new ScoreDetail();
      Object.assign(scoreDetailEntity, {
        ...data,
        score,
        teacher,
        student,
        criteria,
        teacherType: teacherRole,
      });

      // save score detail
      await this.repository.manager.save(scoreDetailEntity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Score detail already exists');
      }
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating score detail');
    }
  }

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
      throw new NotFoundException(`Nhóm chưa có đề tài`);
    }
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
          groupedScores[type].totalWeight += weight;
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
      throw new InternalServerErrorException(
        'Error calculating weighted total score',
      );
    }
  }

  async updateScoreDetail(
    id: number,
    updateData: Partial<ScoreDetail>,
  ): Promise<ScoreDetail> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const scoreDetail = await queryRunner.manager.findOne(ScoreDetail, {
        where: { id },
      });
      if (!scoreDetail) {
        throw new NotFoundException('Score detail not found');
      }

      Object.assign(scoreDetail, updateData);
      const updatedScoreDetail = await queryRunner.manager.save(scoreDetail);

      await queryRunner.commitTransaction();
      return updatedScoreDetail;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error updating score detail');
    } finally {
      await queryRunner.release();
    }
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

      // If no specific teacher type is requested, or if specifically requesting advisor groups
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
          ],
        });

        // Add a custom field to identify the role
        advisorGroups.forEach((group) => {
          (group as any).teacherRole = 'advisor';
        });

        allGroups = [...allGroups, ...advisorGroups];

        // If we only wanted advisor groups, return now
        if (teacherType === 'advisor') return allGroups;
      }

      // If no specific teacher type, or if specifically requesting reviewer groups
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
          .getMany();

        reviewerGroups.forEach((group) => {
          (group as any).teacherRole = 'reviewer';
        });

        allGroups = [...allGroups, ...reviewerGroups];

        // If we only wanted reviewer groups, return now
        if (teacherType === 'reviewer') return allGroups;
      }

      // If no specific teacher type, or if specifically requesting committee groups
      if (!teacherType || teacherType === 'committee') {
        // First get all committees where this teacher is a member
        const committees = await this.dataSource
          .createQueryBuilder()
          .select('committee')
          .from(Committee, 'committee')
          .innerJoin(
            'committee.teachers',
            'teacher',
            'teacher.id = :teacherId',
            { teacherId },
          )
          .getMany();

        if (committees.length > 0) {
          // Then get all projects associated with these committees
          const committeeIds = committees.map((committee) => committee.id);

          // Finally get groups associated with these projects where the project has a committee link
          const committeeGroups = await this.groupRepository
            .createQueryBuilder('group')
            .innerJoinAndSelect('group.project', 'project')
            .innerJoin(
              'project.committees',
              'committee',
              'committee.id IN (:...committeeIds)',
              { committeeIds },
            )
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
        }

        // If we only wanted committee groups, return now
        if (teacherType === 'committee') return allGroups;
      }

      return allGroups;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error retrieving groups for teacher',
      );
    }
  }

  async getScoreDetailByStudentId(studentId: number): Promise<any> {
    try {
      // Get overall scores by teacher type
      const scoresByType = await this.calculateScoresByTeacherType(studentId);
      const {
        weightedTotal,
        missingEvaluations,
        isComplete,
        appliedWeights,
        ...weightedTotalScore
      } = await this.calculateWeightedTotalScore(studentId);

      // Get score details
      const scoreDetails = await this.scoreDetailRepository.find({
        where: { student: { id: studentId } },
        relations: ['criteria'],
        select: {
          id: true,
          scoreValue: true,
          teacherType: true,
          comment: true,
          criteria: {
            name: true,
            content: true,
            max_score: true,
            weightPercent: true,
            step: true,
          },
        },
      });

      if (!scoreDetails || scoreDetails.length === 0) {
        throw new NotFoundException('No score details found for this student');
      }

      // Group score details by teacherType
      const groupedScoreDetails = scoreDetails.reduce((acc, detail) => {
        const type = detail.teacherType || 'unknown';
        if (!acc[type]) {
          acc[type] = [];
        }

        // Remove teacherType from the detail to match the expected format
        const { teacherType, ...detailWithoutType } = detail;
        acc[type].push(detailWithoutType);
        return acc;
      }, {});

      const result = { ...groupedScoreDetails };

      // Add overall score for each teacher type at the beginning of the array
      if (scoresByType) {
        Object.keys(result).forEach((type) => {
          if (scoresByType[type]?.score !== null) {
            // Add overall score as a property to the group
            result[`${type}_overall`] = scoresByType[type].score;
          }
        });
      }
      return {
        ...result,
        weightedTotal,
        appliedWeights,
        isComplete,
        missingEvaluations,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving score details:', error);
      throw new InternalServerErrorException(
        'Error retrieving score details for student',
      );
    }
  }

  //Calculate group&student score, save to database
  async publicScore(groupId: any) {
    //validate groupId
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['students', 'project'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const members = group.students;
    if (!members || members.length === 0) {
      throw new NotFoundException('No students found in this group');
    }
    // Check if group score already exists
    const existingGroupScore = await this.scoreRepository.findOne({
      where: { group: { id: groupId } },
    });
    if (existingGroupScore) {
      throw new ConflictException('Group score already exists');
    }
    // Check if student score already exists
    for (const member of members) {
      const existingStudentScore = await this.scoreRepository.findOne({
        where: { student: { id: member.id } },
      });
      if (existingStudentScore) {
        throw new ConflictException(
          `Student score already exists for student ID ${member.id}`,
        );
      }
    }

    var groupScore = 0;

    // Init student score in SCORE table (group_id = null)
    for (const member of members) {
      const score = await this.calculateWeightedTotalScore(member.id);
      if (!score) {
        throw new NotFoundException(
          `Score by detail of student has not finished yet`,
        );
      }
      if (score) {
        const newScore = new Score();
        newScore.student = member;
        newScore.group = null;
        newScore.project = group.project;
        newScore.total_score = score.weightedTotal;
        newScore.comment = 'Student score';
        await this.repository.manager.save(newScore);
      }
      groupScore += score.weightedTotal;
    }

    groupScore = groupScore / members.length;

    // Init group score in SCORE table (student_id = null)
    const groupScoreEntity = new Score();
    groupScoreEntity.group = group;
    groupScoreEntity.project = group.project;
    groupScoreEntity.total_score = groupScore;
    groupScoreEntity.comment = 'Group score';
    groupScoreEntity.student = null;
    await this.repository.manager.save(groupScoreEntity);
  }
}
