import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { BaseService } from 'src/common/base.service';
import { Like, Repository } from 'typeorm';

@Injectable()
export class StudentsService extends BaseService<Student> {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {
    super(studentRepository);
  }
async getAllStudent(
  search?: string,
  limit?: number,
  page?: number,
): Promise<{ items: Student[]; total: number; limit?: number; page?: number }> {
  const queryBuilder = this.repository.createQueryBuilder('student')
    .leftJoinAndSelect('student.user', 'user')
    .leftJoinAndSelect('student.major', 'major')
    .leftJoinAndSelect('student.department', 'department');

  if (search) {
    queryBuilder.where('user.username LIKE :search', { search: `%${search}%` });
  }

  const total = await queryBuilder.getCount();

  if (limit && page) {
    queryBuilder.skip((page - 1) * limit).take(limit);
  }

  const items = await queryBuilder.getMany();

  return { items, total, ...(limit && { limit }), ...(page && { page }) };
}

}
