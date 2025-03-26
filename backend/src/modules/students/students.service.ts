import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { BaseService } from 'src/common/base.service';
import { Like, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { Department } from 'src/entities/department.entity';
import { Major } from 'src/entities/major.entity';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService extends BaseService<Student> {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
      @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
        @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
                @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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

async createStudent(student: CreateStudentDto): Promise<Student> {
  const { department_id, major_id, user, ...data } = student;

  // Truy vấn song song để lấy khoa & chuyên ngành
  const [department, major] = await Promise.all([
    this.departmentRepository.createQueryBuilder('department').where('department.id = :id', { id: department_id }).getOne(),
    this.majorRepository.createQueryBuilder('major').where('major.id = :id', { id: major_id }).getOne(),
  ]);

  if (!department) throw new NotFoundException(`Khoa ID ${department_id} không tồn tại`);
  if (!major) throw new NotFoundException(`Chuyên ngành ID ${major_id} không tồn tại`);

  const { password,...userData } :any = user; // Tách password khỏi userData
  const newPass = await bcrypt.hash(password ?? 'password', 10); // Hash mật khẩu mới 
  const updatedUser = { ...userData, password: newPass,role:'student',username:data.code  }; // Gán password mới vào userData
  const savedUser =  await this.userRepository.save(updatedUser);
 
  // Nếu user chưa tồn tại, tạo mới
  if (savedUser) {
    try {
    const newStudent = this.studentRepository.create({ ...data, department, major, user: savedUser });
    return await this.studentRepository.save(newStudent);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi thêm sinh viên: ${error.message}`);
    }
  }

  
}




}
