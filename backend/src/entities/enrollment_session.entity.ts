import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Course } from './course.entity';

@Entity('enrollment_session')
export class EnrollmentSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => Department, (department) => department.enrollmentSessions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Course, (course) => course.enrollmentSessions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
