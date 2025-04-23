import { Module } from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CommitteesController } from './committees.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Committee } from 'src/entities/committee.entity';
import { Project } from 'src/entities/project.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Course } from 'src/entities/course.entity';
import { Department } from 'src/entities/department.entity';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Committee,
      Project,
      Teacher,
      Course,
      Department,
      EvaluationForm,
    ]),
  ],
  controllers: [CommitteesController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
