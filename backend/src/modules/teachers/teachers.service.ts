import {
  BadRequestException,
  ConflictException,
  Injectable,
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
  ): Promise<Teacher | null> {
    const { positionIds, departmentId, ...teacherData } = teacher;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingTeacher = await this.check_exist_with_data(
        Teacher,
        {
          where: { id },
          relations: ['user'],
        },
        'Giáo viên không tại',
      );

      // Update user
      const updatedUser = await this.userRepository.save({
        ...existingTeacher.user,
        ...teacherData.user,
      });
      // Update department
      const updatedDepartment = await this.departmentRepository.findOneBy({
        id: departmentId,
      });
      // Update teacher
      const updatedTeacher = await this.teacherRepository.save({
        ...existingTeacher,
        ...teacherData,
        user: updatedUser,
        department: updatedDepartment,
      });

      // Update positions
      if (positionIds && positionIds.length > 0) {
        const positions = await this.positionRepository.find({
          where: { id: In(positionIds) },
        });
        updatedTeacher.position = positions;
      }

      await queryRunner.commitTransaction();
      return updatedTeacher;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
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
