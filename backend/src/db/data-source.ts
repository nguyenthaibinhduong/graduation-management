import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from 'src/entities/user.entity';
import { Student } from 'src/entities/student.entity';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Major } from 'src/entities/major.entity';
import { Course } from 'src/entities/course.entity';
import { Department } from 'src/entities/department.entity';
import { Project } from 'src/entities/project.entity';
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';
import { Group } from 'src/entities/group.entity';
import { Score } from 'src/entities/score.entity';
import { Criteria } from 'src/entities/criteria.entity';
import { Position } from 'src/entities/position.entity';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import { Committee } from 'src/entities/committee.entity';
import { ScoreDetail } from 'src/entities/score_detail.entity';
// Load biến môi trường từ file .env
dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'mysql', // Mặc định là MySQL
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Student,
    Major,
    Course,
    RefreshToken,
    Teacher,
    Department,
    Project,
    EnrollmentSession,
    Group,
    Score,
    ScoreDetail,
    Criteria,
    Position,
    EvaluationForm,
    Committee,
    Position,
  ],
  subscribers: [],
});
