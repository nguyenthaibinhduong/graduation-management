import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { Committee } from 'src/entities/committee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Course } from 'src/entities/course.entity';
import { Department } from 'src/entities/department.entity';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import { Project } from 'src/entities/project.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(Committee)
    private readonly committeeRepository: Repository<Committee>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(EvaluationForm)
    private readonly evaluationFormRepository: Repository<EvaluationForm>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly dataSource: DataSource,
  ) {}

  async createCommittee(commiteeData: CreateCommitteeDto): Promise<Committee> {
    const {
      course_id,
      department_id,
      evaluation_id,
      project_ids,
      teacher_ids,
      ...data
    } = commiteeData;

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate course
      const course = course_id
        ? await this.courseRepository.findOne({ where: { id: course_id } })
        : null;
      if (course_id && !course) {
        throw new NotFoundException(`Course with ID ${course_id} not found`);
      }

      // Validate department
      const department = department_id
        ? await this.departmentRepository.findOne({
            where: { id: department_id },
          })
        : null;
      if (department_id && !department) {
        throw new NotFoundException(
          `Department with ID ${department_id} not found`,
        );
      }

      // Validate evaluation form
      const evaluationForm = evaluation_id
        ? await this.evaluationFormRepository.findOne({
            where: { id: evaluation_id },
          })
        : null;
      if (evaluation_id && !evaluationForm) {
        throw new NotFoundException(
          `Evaluation form with ID ${evaluation_id} not found`,
        );
      }

      // Validate projects
      const projects = project_ids
        ? await this.projectRepository.findByIds(project_ids)
        : [];
      if (project_ids && projects.length !== project_ids.length) {
        const foundIds = projects.map((p) => p.id);
        const missingIds = project_ids.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Projects with IDs ${missingIds.join(', ')} not found`,
        );
      }

      // Validate teachers
      const teachers = teacher_ids
        ? await this.teacherRepository.findByIds(teacher_ids)
        : [];
      if (teacher_ids && teachers.length !== teacher_ids.length) {
        const foundIds = teachers.map((t) => t.id);
        const missingIds = teacher_ids.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Teachers with IDs ${missingIds.join(', ')} not found`,
        );
      }

      // Create the committee
      const newCommittee = queryRunner.manager.create(Committee, {
        ...data,
        course,
        department,
        evaluationForm,
        projects,
        teachers,
      });

      // Save the committee
      const savedCommittee = await queryRunner.manager.save(
        Committee,
        newCommittee,
      );

      // Commit the transaction
      await queryRunner.commitTransaction();
      return savedCommittee;
    } catch (error) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getAllCommittees(
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{
    items: Committee[];
    total: number;
    limit?: number;
    page?: number;
  }> {
    const where = search ? { name: Like(`%${search}%`) } : {};
    const [items, total] = await this.committeeRepository.findAndCount({
      where,
      relations: [
        'course',
        'department',
        'evaluationForm',
        'teachers',
        'projects',
      ],
      skip: limit && page ? (page - 1) * limit : undefined,
      take: limit,
    });
    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }
}
