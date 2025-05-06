import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { BaseService } from 'src/common/base.service';
import { Like, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { Department } from 'src/entities/department.entity';
import { Major } from 'src/entities/major.entity';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateStudentDto } from './dto/update-student.dto';

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
  department_id: any,
  major_id: any,
  orderBy: string,
  search?: string,
  limit?: number,
  page?: number,
): Promise<{ items: Student[]; total: number; limit?: number; page?: number }> {
  // Xây dựng object where động
  const where: any = {
    ...(search && {
      user: {
        fullname: Like(`%${search}%`)
      }
    }),
    ...(department_id && { department: { id: department_id } }),
    ...(major_id && { major: { id: major_id } }),
  };

  const [items, total] = await this.repository.findAndCount({
    where,
    relations: {
      user: true,
      major: true,
      department: true
    },
    order: {
      created_at: orderBy === 'DESC' ? 'DESC' : 'ASC' // ví dụ cho sort
    },
    skip: limit && page ? (page - 1) * limit : undefined,
    take: limit,
  });

  // Xóa mật khẩu khỏi kết quả trả về
  items.forEach((student) => {
    if (student.user) {
      delete student.user.password;
    }
  });

  return {
    items,
    total,
    ...(limit && { limit }),
    ...(page && { page })
  };
}


async createStudent(student: CreateStudentDto): Promise<Student> {
    const { department_id, major_id, user, ...data } = student;
    const [department, major] = await Promise.all([
      this.departmentRepository.createQueryBuilder('department').where('department.id = :id', { id: department_id }).getOne(),
      this.majorRepository.createQueryBuilder('major').where('major.id = :id', { id: major_id }).getOne(),
    ]);
    if (!department) throw new NotFoundException(`Khoa không tồn tại`);
    if (!major) throw new NotFoundException(`Chuyên ngành không tồn tại`);
    const { password,...userData } :any = user; 
    const newPass = await bcrypt.hash(password ?? 'password', 10); 
    const updatedUser = { ...userData, password: newPass,role:'student',username:data.code  }; 
    const savedUser =  await this.userRepository.save(updatedUser);
    if (savedUser) {
      try {
      const newStudent = this.studentRepository.create({ ...data, department, major, user: savedUser });
      return await this.studentRepository.save(newStudent);
      } catch (error) {
        throw new BadRequestException(`Lỗi khi thêm sinh viên: ${error.message}`);
      }
    }

    
}

async updateStudent(id: string, dataStudent: UpdateStudentDto): Promise<Student> {
  try {
    const { department_id, major_id, user, ...data } = dataStudent;

    const existingStudent = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('student.department', 'department')
      .leftJoinAndSelect('student.user', 'user')
      .where('student.id = :id', { id })
      .getOne();

    if (!existingStudent) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    const [department, major] = await Promise.all([
      this.departmentRepository
        .createQueryBuilder()
        .where('id = :id', { id: department_id })
        .getOne(),
      this.majorRepository
        .createQueryBuilder()
        .where('id = :id', { id: major_id })
        .getOne(),
    ]);

    if (!department && department_id) throw new NotFoundException('Khoa không tồn tại');
    if (!major && major_id) throw new NotFoundException('Chuyên ngành không tồn tại');

    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({ ...user })
        .where('id = :id', { id: existingStudent.user.id })
        .execute();
    }

    await this.studentRepository
      .createQueryBuilder()
      .update()
      .set({ 
        ...data, 
        department: department ?? existingStudent.department, 
        major: major ?? existingStudent.major 
      })
      .where('id = :id', { id })
      .execute();


    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.department', 'department')
      .leftJoinAndSelect('student.major', 'major')
      .where('student.id = :id', { id })
      .getOne();

    if (student && student.user) {
      delete student.user.password; // Xóa password trước khi trả về
    }

    return student;
  } catch (error) {
    throw new InternalServerErrorException(error.message || 'Có lỗi xảy ra khi cập nhật sinh viên');
  }
  }

  async createManyStudent(students: CreateStudentDto[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      try {
        await this.createStudent(student);
        success++;
      } catch (error) {
        errors.push(`Dòng ${i + 2}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  
  




}
