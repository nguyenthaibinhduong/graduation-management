import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Course } from 'src/entities/course.entity';
import { Department } from 'src/entities/department.entity';
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';
import { Like, Repository } from 'typeorm';
import { CreateEnrollmentSessionDto } from './dto/create-enrollment_session.dto';
import { UpdateEnrollmentSessionDto } from './dto/update-enrollment_session.dto';

@Injectable()
export class EnrollmentSessionsService extends BaseService<EnrollmentSession> {
  constructor(
    @InjectRepository(EnrollmentSession)
    private readonly enrollmentSessionRepository: Repository<EnrollmentSession>,
      @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
       @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
  ) {
    super(enrollmentSessionRepository);
  }
    async getAllEnrollmentSession(
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{ items: EnrollmentSession[]; total: number; limit?: number; page?: number }> {
    const where:any = search
      ? {
          name: Like(`%${search}%`)
        }
      : {};
  
    const [items, total] = await this.repository.findAndCount({
      where,
      relations: { course:true,department:true},
      skip: limit && page ? (page - 1) * limit : undefined,
      take: limit,
    });
  
    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }
  async createEnrollmentSession(enrollmentSession: CreateEnrollmentSessionDto): Promise<EnrollmentSession[]> {
  const { department_id, course_id, ...data }:any = enrollmentSession;

  const department = await this.departmentRepository.findOneBy({ id: department_id });
  if (!department) {
    throw new NotFoundException(`Khoa không tồn tại`);
  }

  const course = await this.courseRepository.findOneBy({ id: course_id });
  if (!course) {
    throw new NotFoundException(`Học kỳ không tồn tại`);
  }

  try {
    const newEnrollmentSession = this.enrollmentSessionRepository.create({
      ...data,
      department,
      course,
    });
    return await this.enrollmentSessionRepository.save(newEnrollmentSession);
  } catch (error) {
    throw new BadRequestException(`Lỗi khi thêm đợt đăng ký: ${error.message}`);
  }
  }
  
  async updateEnrollmentSession(id: any, dataEnrollmentSession: UpdateEnrollmentSessionDto): Promise<EnrollmentSession> {
    try {
      const { department_id, course_id, ...data } = dataEnrollmentSession;
  
      const existingEnrollmentSession = await this.enrollmentSessionRepository
        .createQueryBuilder('enrollmentSession')
        .leftJoinAndSelect('enrollmentSession.course', 'course')
        .leftJoinAndSelect('enrollmentSession.department', 'department')
        .leftJoinAndSelect('enrollmentSession.user', 'user')
        .where('enrollmentSession.id = :id', { id })
        .getOne();
  
      if (!existingEnrollmentSession) {
        throw new NotFoundException('Đợt đăng ký không tồn tại');
      }
  
      const [department, course] = await Promise.all([
        this.departmentRepository
          .createQueryBuilder()
          .where('id = :id', { id: department_id })
          .getOne(),
        this.courseRepository
          .createQueryBuilder()
          .where('id = :id', { id: course_id })
          .getOne(),
      ]);
  
      if (!department && department_id) throw new NotFoundException('Khoa không tồn tại');
      if (!course && course_id) throw new NotFoundException('Học kỳ không tồn tại');
  
      await this.enrollmentSessionRepository
        .createQueryBuilder()
        .update()
        .set({ 
          ...data, 
          department: department ?? existingEnrollmentSession.department, 
          course: course ?? existingEnrollmentSession.course 
        })
        .where('id = :id', { id })
        .execute();
  
  
      const enrollmentSession = await this.enrollmentSessionRepository
        .createQueryBuilder('enrollmentSession')
        .leftJoinAndSelect('enrollmentSession.user', 'user')
        .leftJoinAndSelect('enrollmentSession.department', 'department')
        .leftJoinAndSelect('enrollmentSession.course', 'course')
        .where('enrollmentSession.id = :id', { id })
        .getOne();

  
      return enrollmentSession;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Có lỗi xảy ra khi cập nhật đợt đăng ký');
    }
  }

}