import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Teacher } from 'src/entities/teacher.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService extends BaseService<Teacher> {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {
    super(teacherRepository);
  }

  async createTeacher(teacher: CreateTeacherDto): Promise<Teacher> {
    const { user, ...teacherData } = teacher;

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
}
