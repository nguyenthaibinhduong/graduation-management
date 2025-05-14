import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { AppDataSource } from './db/data-source';
import { StudentsModule } from './modules/students/students.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { MajorsModule } from './modules/majors/majors.module';
import { PositionsModule } from './modules/positions/positions.module';
import { DepartmentModule } from './modules/department/department.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentSessionModule } from './modules/enrollment_session/enrollment_session.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UploadModule } from './modules/upload/upload.module';
import { EvaluationFormModule } from './modules/evaluation_form/evaluation_form.module';
import { ScoreModule } from './modules/score/score.module';
import { CommitteesModule } from './modules/committees/committees.module';
import { GroupsModule } from './modules/groups/groups.module';
import { CriteriaModule } from './modules/criteria/criteria.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Làm cho config có sẵn toàn bộ ứng dụng
      envFilePath: '.env', // Đường dẫn đến tệp .env
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    StudentsModule,
    AuthModule,
    TeachersModule,
    MajorsModule,
    PositionsModule,
    DepartmentModule,
    CoursesModule,
    EnrollmentSessionModule,
    ProjectsModule,
    UploadModule,
    EvaluationFormModule,
    ScoreModule,
    CommitteesModule,
    GroupsModule,
    CriteriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (this.dataSource.isInitialized) {
      console.log('Kết nối cơ sở dữ liệu thành công!'); // Thông báo khi kết nối thành công
    } else {
      console.error('Không thể kết nối tới cơ sở dữ liệu!');
    }
  }
}
