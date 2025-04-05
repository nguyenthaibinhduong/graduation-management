import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Teacher } from 'src/entities/teacher.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Position } from 'src/entities/position.entity';

@Injectable()
export class TeachersService extends BaseService<Teacher> {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    private readonly dataSource: DataSource,
  ) {
    super(teacherRepository);
  }

  async createTeacher(teacher: CreateTeacherDto): Promise<Teacher> {
    const { user, positionIds, ...teacherData } = teacher;

    //Kiem tra neu giao vien da ton tai
    const existingTeacher = await this.teacherRepository.findOne({
      where: { code: teacherData.code },
    });
    if (existingTeacher) {
      throw new ConflictException(
        `Giáo viên với mã ${teacherData.code} đã tồn tại`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    //Xu ly transaction
    try {
      // Tao user
      const { password, ...userData }: any = user;
      const hashedPassword = await bcrypt.hash(password ?? 'password', 10);

      const newUser = queryRunner.manager.create(User, {
        ...userData,
        password: hashedPassword,
        role: 'teacher',
        username: teacherData.code,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      // Tao giao vien
      const newTeacher = queryRunner.manager.create(Teacher, {
        ...teacherData,
        user: savedUser,
      });

      //Teacher position
      if (positionIds && positionIds.length > 0) {
        const positions = await this.positionRepository.find({
          where: { id: In(positionIds) },
        });
        newTeacher.position = positions;
      }

      const savedTeacher = await queryRunner.manager.save(newTeacher);

      //Commit transaction
      await queryRunner.commitTransaction();
      return savedTeacher;
    } catch (error) {
      //Rollback transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      //Ket thuc transaction
      await queryRunner.release();
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
      .leftJoinAndSelect('teacher.position', 'position');

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

    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }

  async updateTeacher(
    id: number,
    teacher: CreateTeacherDto,
  ): Promise<Teacher | null> {
    const { positionIds, ...teacherData } = teacher;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingTeacher = await this.teacherRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existingTeacher) {
        return null;
      }

      // Update user
      const updatedUser = await this.userRepository.save({
        ...existingTeacher.user,
        ...teacherData.user,
      });

      // Update teacher
      const updatedTeacher = await this.teacherRepository.save({
        ...existingTeacher,
        ...teacherData,
        user: updatedUser,
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
