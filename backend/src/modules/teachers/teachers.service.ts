import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Teacher } from 'src/entities/teacher.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Position } from 'src/entities/position.entity';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Department } from 'src/entities/department.entity';
import { ne } from '@faker-js/faker/.';
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { Project } from 'src/entities/project.entity';

@Injectable()
export class TeachersService extends BaseService<Teacher> {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly dataSource: DataSource,
  ) {
    super(teacherRepository);
  }

  async createTeacher(teacherDto: any): Promise<Teacher> {
    const { user, positionIds, departmentId, ...teacherData } = teacherDto;
    await this.check_exist_no_data(
      Teacher,
      { code: teacherData.code },
      'Giáo viên đã tồn tại',
    );
    //const department = await this.check_exist_with_data(Department,{ id: departmentId },'Khoa không tồn tại');
    const department = await this.departmentRepository.findOneBy({
      id: departmentId,
    });
    let positions = [];
    if (positionIds?.length > 0)
      positions = await this.positionRepository.find({
        where: { id: In(positionIds) },
      });

    // 4. Tạo User
    const { password, ...userData }: any = user;
    const hashedPassword = await bcrypt.hash(password ?? 'password', 10);
    const newUser: any = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'teacher',
      username: teacherData.code,
    });

    const savedUser = await this.userRepository.save(newUser);

    // 5. Tạo Teacher
    try {
      const newTeacher = this.teacherRepository.create({
        ...teacherData,
        user: savedUser,
        department,
        position: positions,
      });
      const dataTc: any = await this.teacherRepository.save(newTeacher);
      return dataTc;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi thêm giáo viên: ${error.message}`);
    }
  }

  async getAllTeachers(
    department_id?: any,
    position_ids?: number[],
    orderBy?: string,
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{
    items: any[];
    total: number;
    limit?: number;
    page?: number;
  }> {
    const where: any = {
      ...(search && {
        user: {
          fullname: Like(`%${search}%`),
        },
      }),
      ...(department_id && { department: { id: department_id } }),
      ...(position_ids?.length > 0 && { position: { id: In(position_ids) } }),
    };

    const [items, total] = await this.repository.findAndCount({
      where,
      relations: {
        user: true,
        position: true,
        department: true,
      },
      order: {
        created_at: orderBy === 'DESC' ? 'DESC' : 'ASC', // ví dụ cho sort
      },
      skip: limit && page ? (page - 1) * limit : undefined,
      take: limit,
    });

    // Xóa mật khẩu khỏi kết quả trả về
    items.forEach((teacher) => {
      if (teacher.user) {
        delete teacher.user.password;
      }
    });

    // const teachers = items.map((teacher) => {
    //   const { id, user, ...rest } = teacher;
    //   return {
    //     ...rest,
    //     id: this.jwtUtilityService.encodeId(id),
    //     user: {
    //       ...user,
    //       id: this.jwtUtilityService.encodeId(user.id.toString()),
    //     },
    //   };
    // });

    return {
      items,
      total,
      ...(limit && { limit }),
      ...(page && { page }),
    };
  }

async updateTeacher(
  id: string,
  teacher: UpdateTeacherDto,
): Promise<Teacher> {
  try {
    const { positionIds, departmentId, user, ...teacherData }: any = teacher;

    const existingTeacher = await this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.department', 'department')
      .leftJoinAndSelect('teacher.position', 'position')
      .where('teacher.id = :id', { id })
      .getOne();

    if (!existingTeacher) {
      throw new NotFoundException('Giáo viên không tồn tại');
    }

    if (user && user?.id) {
      delete user?.id; // Tránh ghi đè ID người dùng
    }

    if (user) {
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({ ...user })
        .where('id = :id', { id: existingTeacher.user.id })
        .execute();
    }

    let department = existingTeacher.department;
    if (departmentId) {
      department = await this.departmentRepository
        .createQueryBuilder()
        .where('id = :id', { id: departmentId })
        .getOne();

      if (!department) {
        throw new NotFoundException('Khoa không tồn tại');
      }
    }

    let positions = existingTeacher.position;
    if (positionIds && Array.isArray(positionIds)) {
      positions = await this.positionRepository
        .createQueryBuilder('position')
        .where('position.id IN (:...ids)', { ids: positionIds })
        .getMany();

      if (positions.length !== positionIds.length) {
        throw new NotFoundException('Một hoặc nhiều chức vụ không tồn tại');
      }
    }

    await this.teacherRepository
      .createQueryBuilder()
      .update()
      .set({
        ...teacherData,
        department,
        position: positions,
      })
      .where('id = :id', { id })
      .execute();

    const updatedTeacher = await this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.department', 'department')
      .leftJoinAndSelect('teacher.position', 'position')
      .where('teacher.id = :id', { id })
      .getOne();

    if (updatedTeacher?.user) {
      delete updatedTeacher.user.password; // Xóa password trước khi trả về
    }

    return updatedTeacher;
  } catch (error) {
    throw new InternalServerErrorException(
      error.message || 'Có lỗi xảy ra khi cập nhật giáo viên',
    );
  }
}


  async createManyTeacher(
    teachers: CreateTeacherDto[],
  ): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      try {
        await this.createTeacher(teacher);
        success++;
      } catch (error) {
        errors.push(`Dòng ${i + 1}: ${error.message}`);
      }
    }

    return { success, errors };
  }
}
