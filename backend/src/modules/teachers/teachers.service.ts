import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Teacher } from 'src/entities/teacher.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Position } from 'src/entities/position.entity';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Department } from 'src/entities/department.entity';
import { ne } from '@faker-js/faker/.';

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

  async createTeacher(teacherDto: CreateTeacherDto): Promise<Teacher> {
    const { user, positionIds, departmentId, ...teacherData } = teacherDto;
    await this.check_exist_no_data(Teacher, { code: teacherData.code }, 'Giáo viên đã tồn tại');
    const department = await this.check_exist_with_data(Department,{ id: departmentId },'Khoa không tồn tại');
    let positions = [];
    if (positionIds?.length > 0) positions = await this.positionRepository.find({ where: { id: In(positionIds) }});

    // 4. Tạo User
    const { password, ...userData }: any = user;
    const hashedPassword = await bcrypt.hash(password ?? 'password', 10);
    const newUser:any = this.userRepository.create({
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
      return await this.teacherRepository.save(newTeacher);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi thêm giáo viên: ${error.message}`);
    }
  }



  async getAllTeachers(
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{
    items: Teacher[];
    total: number;
    limit?: number;
    page?: number;
  }> {
    const queryBuilder = this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .leftJoinAndSelect('teacher.position', 'position')
      .leftJoinAndSelect('teacher.department', 'department');

    if (search) {
      queryBuilder.where('user.username LIKE :search', {
        search: `%${search}%`,
      });
    }

    const total = await queryBuilder.getCount();

    if (limit && page) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const items = await queryBuilder.getMany();

    items.forEach((item) => {
      if (item.user) {
        delete item.user.password;
      }
    });

    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }

  async updateTeacher(
    id: number,
    teacher: UpdateTeacherDto,
  ): Promise<Teacher | null> {
    const { positionIds, departmentId, ...teacherData } = teacher;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingTeacher = await this.check_exist_with_data(Teacher,{
        where: { id },
        relations: ['user'],
      },'Giáo viên không tại');

      // Update user
      const updatedUser = await this.userRepository.save({...existingTeacher.user,...teacherData.user});
      // Update department
      const updatedDepartment = await this.departmentRepository.findOneBy({id: departmentId,});
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
}
