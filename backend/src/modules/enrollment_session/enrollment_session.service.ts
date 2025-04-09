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
  
async updateEnrollmentSession(id: number, dataEnrollmentSession: UpdateEnrollmentSessionDto): Promise<EnrollmentSession> {
  try {
    const { department_id, course_id, ...data }:any = dataEnrollmentSession;

    const existingEnrollmentSession = await this.enrollmentSessionRepository.findOne({
      where: { id },
      relations: ['course', 'department'],
    });

    if (!existingEnrollmentSession) {
      throw new NotFoundException('Đợt đăng ký không tồn tại');
    }

    let department = existingEnrollmentSession.department;
    let course = existingEnrollmentSession.course;

    if (department_id) {
      department = await this.departmentRepository.findOne({ where: { id: department_id } });
      if (!department) throw new NotFoundException('Khoa không tồn tại');
    }

    if (course_id) {
      course = await this.courseRepository.findOne({ where: { id: course_id } });
      if (!course) throw new NotFoundException('Học kỳ không tồn tại');
    }

    const updatedEnrollmentSession = this.enrollmentSessionRepository.create({
      ...existingEnrollmentSession,
      ...data,/// ghi de cac ban ghi moi 
      department,/// ghi de cac ban ghi moi 
      course,/// ghi de cac ban ghi moi 
    });

    await this.enrollmentSessionRepository.save(updatedEnrollmentSession);

    const enrollmentSession = await this.enrollmentSessionRepository.findOne({
      where: { id },
      relations: {course:true, department:true },
    });

    return enrollmentSession;
  } catch (error) {
    throw new InternalServerErrorException(error.message || 'Có lỗi xảy ra khi cập nhật đợt đăng ký');
  }
}


}