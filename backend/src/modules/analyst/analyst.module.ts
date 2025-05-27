import { Module } from '@nestjs/common';
import { AnalystService } from './analyst.service';
import { AnalystController } from './analyst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Project } from 'src/entities/project.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([ 
        Project,
        Teacher,
        Student,
        Department
      ]),
    ],
  controllers: [AnalystController],
  providers: [AnalystService],
})
export class AnalystModule {}
