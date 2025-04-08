import { Module } from '@nestjs/common';
import { EnrollmentSessionsService } from './enrollment_session.service';
import { EnrollmentSessionsController } from './enrollment_session.controller';
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentSession,Department,Course])],
  controllers: [EnrollmentSessionsController],
  providers: [EnrollmentSessionsService],
})
export class EnrollmentSessionModule {}
