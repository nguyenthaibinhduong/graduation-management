import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Department } from 'src/entities/department.entity';
import { Major } from 'src/entities/major.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student,Department,Major,User])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
